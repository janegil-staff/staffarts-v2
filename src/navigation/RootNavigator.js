import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../theme/ThemeContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

export default function RootNavigator() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const { colors, hydrated } = useTheme();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);
console.log('🔍 RootNavigator state:', {
  isLoading,
  hydrated,
  user: !!user,
});
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
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}