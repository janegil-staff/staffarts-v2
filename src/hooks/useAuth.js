import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { tokenStorage } from '../api/client';
import * as authApi from '../api/auth';

export function useAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const signOut = useAuthStore((s) => s.signOut);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const login = async ({ email, password }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { user, accessToken, refreshToken } = await authApi.login({
        email,
        password,
      });
      await tokenStorage.setTokens(accessToken, refreshToken);
      setUser(user);
      return true;
    } catch (e) {
      setError(e?.response?.data?.error || 'Login failed');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

const register = async ({ displayName, email, password }) => {
  setIsSubmitting(true);
  setError(null);
  try {
    const { user, accessToken, refreshToken } = await authApi.register({
      displayName,
      email,
      password,
    });
    await tokenStorage.setTokens(accessToken, refreshToken);
    setUser(user);
    return true;
  } catch (e) {
    // Temporary diagnostic logging
    if (__DEV__) {
      console.log('🔴 REGISTER FAILED');
      console.log('   message:', e.message);
      console.log('   code:', e.code);
      console.log('   status:', e.response?.status);
      console.log('   data:', e.response?.data);
      console.log('   url:', e.config?.url);
      console.log('   baseURL:', e.config?.baseURL);
    }
    setError(e?.response?.data?.error || e.message || 'Registration failed');
    return false;
  } finally {
    setIsSubmitting(false);
  }
};

  const logout = async () => {
    await authApi.logout();
    await signOut();
  };

  return { login, register, logout, isSubmitting, error };
}