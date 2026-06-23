import { useAuth } from "./useAuth";

/**
 * Returns a wrapper that checks auth before executing an action.
 * If not authenticated, redirects to Google login.
 */
export function useRequireAuth() {
  const { isAuthenticated, login } = useAuth();

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      login();
      return;
    }
    action();
  };

  return { requireAuth, isAuthenticated };
}
