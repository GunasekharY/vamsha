import type { JSX } from 'react';
import { useAuthStore } from '../store/auth-store';

export function ProtectedRoute({ children }: { children: JSX.Element }): JSX.Element {
  // Real SSO redirect is disabled for UI mock mode. The app should remain open
  // so the pages can be reviewed without the backend auth flow.
  const accessToken = useAuthStore((state) => state.accessToken);
  if (!accessToken) {
    return children;
  }
  return children;
}
