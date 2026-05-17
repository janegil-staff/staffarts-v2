import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function AppShell() {
  const { scheme } = useTheme();
  return (
    <>
      <RootNavigator />
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </QueryClientProvider>
  );
}