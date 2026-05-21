// src/navigation/RootNavigator.js
//
// Boots the auth session and hosts the navigator. Also owns the global chat
// socket lifecycle:
//   - configureSocket() once, wiring in the query client + a way to read the
//     current user id.
//   - connectSocket() whenever a user becomes present (login / restored session)
//   - disconnectSocket() when the user goes away (logout)
//
// We connect off the user value (not just on mount) because bootstrap() resolves
// the session asynchronously — the token isn't confirmed until the user is set.

import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../theme/ThemeContext';
import AppStack from './AppStack';
import {
  configureSocket,
  connectSocket,
  disconnectSocket,
} from '../services/socket';

export default function RootNavigator() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const user = useAuthStore((s) => s.user);
  const { colors, hydrated } = useTheme();
  const queryClient = useQueryClient();

  // Restore session on startup.
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Configure the socket service once with the query client + user-id getter.
  useEffect(() => {
    configureSocket({
      queryClient,
      getCurrentUserId: () => useAuthStore.getState().user?._id || useAuthStore.getState().user?.id || null,
    });
  }, [queryClient]);

  // Open/close the socket as the auth state changes.
  useEffect(() => {
    const isLoggedIn = !!(user && (user._id || user.id || user.email));
    if (isLoggedIn) {
      connectSocket();
    } else {
      disconnectSocket();
    }
    // No cleanup that disconnects here — we only disconnect on actual logout
    // (handled by the else branch), not on every re-render of this effect.
  }, [user]);

  if (isLoading || !hydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}