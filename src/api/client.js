import axios from 'axios';

const TOKEN_KEY = 'akaguriro_token';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export function resolveStorageUrl(url) {
  if (!url) return null;
  if (!url.includes('/storage/')) return url;

  const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
  const origin = apiBase.replace(/\/api\/v1\/?$/, '');

  return url
    .replace(/^https?:\/\/localhost(?::\d+)?\/storage\//, `${origin}/storage/`)
    .replace(/^https?:\/\/127\.0\.0\.1(?::\d+)?\/storage\//, `${origin}/storage/`);
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('akaguriro_user');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('akaguriro:unauthorized'));
      }
    }
    return Promise.reject(error);
  },
);

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function extractData(response) {
  const body = response?.data;
  // API envelope { success, data, ... }: return data even when null (do not fall back to envelope).
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return body.data;
  }
  return body?.data ?? body;
}

export function extractList(response) {
  const payload = response.data;
  const data = payload?.data;
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

export function getErrorMessage(error, fallback = 'Une erreur est survenue') {
  const data = error.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors).flat().find(Boolean);
    if (first) return first;
  }
  return data?.message || error.message || fallback;
}
