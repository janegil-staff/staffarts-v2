import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';

/**
 * Wrap account-required actions. Returns a function that either:
 *   - Calls the action immediately (user is logged in), OR
 *   - Opens the Login modal (user is anonymous). After successful login,
 *     the modal closes and we re-invoke the action automatically via
 *     a one-shot "pending action" stored in module scope.
 *
 * Usage:
 *   const requireAuth = useRequireAuth();
 *   <Pressable onPress={() => requireAuth(() => save(artworkId))} />
 */

let pendingAction = null;

export function consumePendingAction() {
  const action = pendingAction;
  pendingAction = null;
  return action;
}

export function useRequireAuth() {
  const navigation = useNavigation();
  const isAuthenticated = useAuthStore((s) => !!s.user);

  return (action) => {
    if (isAuthenticated) {
      action();
      return;
    }
    pendingAction = action;
    navigation.navigate('Login');
  };
}