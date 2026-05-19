import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../stores/authStore';
import { tokenStorage } from '../api/client';
import * as authApi from '../api/auth';
import { consumePendingAction } from './useRequireAuth';

export function useAuth() {
  const navigation = useNavigation();
  const setUser = useAuthStore((s) => s.setUser);
  const signOut = useAuthStore((s) => s.signOut);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const afterAuthSuccess = () => {
    if (navigation.canGoBack()) navigation.goBack();
    const action = consumePendingAction();
    if (action) {
      setTimeout(action, 100);
    }
  };

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
      afterAuthSuccess();
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
      afterAuthSuccess();
      return true;
    } catch (e) {
      setError(e?.response?.data?.error || 'Registration failed');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    if (__DEV__) console.log('🚪 LOGOUT STARTED');
    await authApi.logout();
    await signOut();
    if (__DEV__) console.log('🚪 LOGOUT COMPLETE');
    // Reset stack to Welcome — clears any open screens and modals.
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  return { login, register, logout, isSubmitting, error };
}