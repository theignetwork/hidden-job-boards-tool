'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

interface UserData {
  user_id: number;
  email: string;
  name: string;
  membership_level: string;
  exp?: number;
  iat?: number;
}

interface AuthContextType {
  user: UserData | null;
  wpUserId: number | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  wpUserId: null,
  loading: true,
  isAuthenticated: false
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [wpUserId, setWpUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadAuth = async () => {
      console.log('[Auth] Checking for context parameter...');

      // Check if user just switched accounts via WordPress account switcher plugin
      const userSwitched = searchParams?.get('user_switched') || searchParams?.get('switched_back');

      if (userSwitched) {
        console.log('[Auth] 🔄 Detected WordPress account switch - clearing old session data');
        sessionStorage.clear();
      }

      const token = searchParams?.get('context');

      if (token) {
        try {
          console.log('[Auth] Token received, verifying with server...');

          // CRITICAL: Check for old user data BEFORE overwriting
          const oldUserId = sessionStorage.getItem('wp_user_id');

          // Verify token with server (server has the secret, not client!)
          const response = await fetch('/.netlify/functions/verify-jwt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });

          if (!response.ok) {
            throw new Error('Token verification failed');
          }

          const { user: userData } = await response.json();

          // Check if switching from a DIFFERENT user (account switcher scenario)
          if (oldUserId && oldUserId !== userData.user_id.toString()) {
            console.log('[Auth] 🔄 User change detected! Old:', oldUserId, '→ New:', userData.user_id);
            console.log('[Auth] Clearing old session data and reloading with new JWT...');
            sessionStorage.clear();
            // Reload page - JWT is still in URL, so it will load with correct user
            window.location.reload();
            return; // Stop execution here
          }

          // No user change - proceed normally
          sessionStorage.setItem('auth_token', token);
          setUser(userData as UserData);
          setWpUserId(userData.user_id);

          // Store WordPress user ID
          sessionStorage.setItem('wp_user_id', userData.user_id.toString());

          // Store full user data
          sessionStorage.setItem('user_data', JSON.stringify(userData));

          // Clean URL (remove token from address bar for security)
          window.history.replaceState({}, '', window.location.pathname);

          console.log('[Auth] ✅ SUCCESS - User authenticated as WordPress user:', userData.user_id);
          console.log('[Auth] User name:', userData.name);
          console.log('[Auth] Membership:', userData.membership_level);
        } catch (err) {
          console.error('[Auth] ❌ Failed to authenticate:', err);
          // Clear any stored data on failure
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('wp_user_id');
          sessionStorage.removeItem('user_data');
          setUser(null);
          setWpUserId(null);
        }
      } else {
        // NO TOKEN in URL - Check if we have a stored auth token to re-verify
        const storedToken = sessionStorage.getItem('auth_token');
        const storedUserId = sessionStorage.getItem('wp_user_id');
        const storedUserData = sessionStorage.getItem('user_data');

        if (storedToken && storedUserId && storedUserData) {
          try {
            console.log('[Auth] No token in URL, but found stored token - re-verifying...');

            // RE-VERIFY the stored token to prevent user ID bleeding
            const response = await fetch('/.netlify/functions/verify-jwt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: storedToken })
            });

            if (!response.ok) {
              throw new Error('Stored token verification failed');
            }

            const { user: userData } = await response.json();

            // CRITICAL: Check if the verified user ID matches the stored one
            if (userData.user_id.toString() !== storedUserId) {
              console.error('[Auth] 🚨 USER ID MISMATCH! Stored:', storedUserId, 'Verified:', userData.user_id);
              console.error('[Auth] 🚨 SECURITY: Clearing stale session data to prevent data bleeding');

              // Clear old user's data
              sessionStorage.removeItem('auth_token');
              sessionStorage.removeItem('wp_user_id');
              sessionStorage.removeItem('user_data');

              setUser(null);
              setWpUserId(null);

              console.log('[Auth] Auto-refreshing to load correct user data...');

              // Auto-refresh to load the correct user's data
              window.location.reload();
            } else {
              // Token is valid and user ID matches
              setUser(userData as UserData);
              setWpUserId(userData.user_id);
              console.log('[Auth] Re-verified stored WordPress user ID:', userData.user_id);
            }
          } catch (err) {
            console.error('[Auth] Failed to re-verify stored token:', err);
            // Clear invalid/expired stored data
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('wp_user_id');
            sessionStorage.removeItem('user_data');
            setUser(null);
            setWpUserId(null);
          }
        } else {
          console.log('[Auth] No token or stored auth data found - using anonymous mode');
        }
      }

      setLoading(false);
    };

    loadAuth();
  }, [searchParams]);

  return (
    <AuthContext.Provider value={{
      user,
      wpUserId,
      loading,
      isAuthenticated: !!wpUserId
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
