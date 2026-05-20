// src/hooks/useAuth.js
//
// PIN-based auth hook. Wraps the auth API + auth store and handles the
// navigation flow after login/register/logout.

import { useState } from 'react';
import {
  useNavigation,
  CommonActions,
} from '@react-navigation/native';

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

  // After a successful auth: pop the entire auth modal chain back to the
  // underlying Tabs screen, then replay any pending action the user was
  // trying to do when they hit the wall.
  //
  // Why not just goBack()? Because the user may have walked
  // Register → PinSetup → Register (returned with pin) — that's a
  // 3-deep stack, and goBack() only pops one frame.
  const afterAuthSuccess = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Tabs' }],
      }),
    );
    const action = consumePendingAction();
    if (action) {
      setTimeout(action, 100);
    }
  };

  // ── login ────────────────────────────────────────────────────────────
  const login = async ({ email, pin }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { user, accessToken, refreshToken } = await authApi.login({
        email,
        pin,
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

  // ── register ─────────────────────────────────────────────────────────
  const register = async ({ displayName, email, pin, language }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { user, accessToken, refreshToken } = await authApi.register({
        displayName,
        email,
        pin,
        language,
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

  // ── logout ──────────────────────────────────────────────────────────
  const logout = async () => {
    if (__DEV__) console.log('🚪 LOGOUT STARTED');
    await authApi.logout();
    await signOut();
    if (__DEV__) console.log('🚪 LOGOUT COMPLETE');
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Tabs' }],
      }),
    );
  };

  return { login, register, logout, isSubmitting, error, setError };
}