import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  updateProfile as apiUpdateProfile,
  updatePassword as apiUpdatePassword,
} from '../api/services/auth.js';
import { getErrorMessage } from '../api/client.js';

export const GUEST_USER = {
  id: null,
  name: 'Visiteur Public',
  phone: '',
  email: '',
  role: 'VISITOR',
};

function clearAuthCollections(collections) {
  collections.forEach((collection) => {
    collection.value = [];
  });
}

export function createSessionActions({
  currentUser,
  requests,
  receipts,
  sales,
  showToast,
  refreshInBackground,
  saveUser,
  resetSession,
}) {
  const resetState = () => {
    if (typeof resetSession === 'function') {
      resetSession();
      return;
    }

    currentUser.value = GUEST_USER;
    clearAuthCollections([requests, receipts, sales]);
    saveUser(null);
  };

  const setCurrentUser = (user) => {
    currentUser.value = user || GUEST_USER;
    saveUser(user?.id ? user : null);
    if (user?.id) {
      refreshInBackground();
    }
  };

  const login = async (email, password) => {
    const user = await apiLogin(email, password);
    currentUser.value = user;
    showToast(`Connexion réussie — ${user.name}`, 'success');
    refreshInBackground();
    return user;
  };

  const register = async (payload) => {
    const user = await apiRegister(payload);
    currentUser.value = user;
    showToast('Inscription réussie', 'success');
    refreshInBackground();
    return user;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // session may already be invalid
    }
    resetState();
    showToast('Session déconnectée', 'info');
  };

  const updateProfile = async (payload) => {
    try {
      const user = await apiUpdateProfile(payload);
      currentUser.value = user;
      showToast('Profil mis à jour', 'success');
      return user;
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
      throw error;
    }
  };

  const updatePassword = async (payload) => {
    try {
      await apiUpdatePassword(payload);
      showToast('Mot de passe mis à jour', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
      throw error;
    }
  };

  return {
    setCurrentUser,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
  };
}
