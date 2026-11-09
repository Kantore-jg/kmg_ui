import { apiClient, extractData, setToken } from '../client.js';
import { mapUser } from '../mappers.js';

const USER_KEY = 'akaguriro_user';

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export async function login(email, password) {
  const { data } = await apiClient.post('/login', { email, password });
  const payload = extractData({ data });
  const user = mapUser(payload.user);
  setToken(payload.token);
  saveUser(user);
  return user;
}

export async function register({ name, email, phone, password, password_confirmation, avatar }) {
  let response;

  if (avatar) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (phone) formData.append('phone', phone);
    formData.append('password', password);
    formData.append('password_confirmation', password_confirmation || password);
    formData.append('avatar', avatar);

    response = await apiClient.post('/register', formData);
  } else {
    response = await apiClient.post('/register', {
      name,
      email,
      phone,
      password,
      password_confirmation: password_confirmation || password,
    });
  }

  const payload = extractData(response);
  const user = mapUser(payload.user);
  setToken(payload.token);
  saveUser(user);
  return user;
}

export async function logout() {
  try {
    await apiClient.post('/logout');
  } finally {
    setToken(null);
    saveUser(null);
  }
}

export async function fetchProfile() {
  const { data } = await apiClient.get('/profile');
  const user = mapUser(extractData({ data }));
  saveUser(user);
  return user;
}

export async function updateProfile({ name, email, phone, avatar }) {
  let response;

  if (avatar) {
    const formData = new FormData();
    if (name !== undefined) formData.append('name', name);
    if (email !== undefined) formData.append('email', email);
    if (phone !== undefined) formData.append('phone', phone || '');
    formData.append('avatar', avatar);
    formData.append('_method', 'PUT');
    response = await apiClient.post('/profile', formData);
  } else {
    response = await apiClient.put('/profile', { name, email, phone });
  }

  const user = mapUser(extractData(response));
  saveUser(user);
  return user;
}

export async function updatePassword({ current_password, password, password_confirmation }) {
  await apiClient.put('/password', {
    current_password,
    password,
    password_confirmation: password_confirmation || password,
  });
}

export function clearSession() {
  setToken(null);
  saveUser(null);
}