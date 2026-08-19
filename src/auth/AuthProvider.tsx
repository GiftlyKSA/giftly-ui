import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { logout } from '../api/auth';
import { getMe } from '../api/giftly';
import { SessionResponse, UserProfile } from '../api/types';
import { clearSession, readSession, saveSession, subscribeToSession } from './secureSession';

type AuthPhase = 'restoring' | 'guest' | 'authenticated';

interface AuthContextValue {
  phase: AuthPhase;
  profile: UserProfile | null;
  accessToken: string | null;
  signIn: (session: SessionResponse) => Promise<UserProfile>;
  refreshProfile: () => Promise<UserProfile>;
  updateCachedProfile: (profile: UserProfile) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [phase, setPhase] = useState<AuthPhase>('restoring');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const resetToGuest = useCallback(async () => {
    await clearSession();
    setProfile(null);
    setAccessToken(null);
    setPhase('guest');
  }, []);

  const refreshProfile = useCallback(async (): Promise<UserProfile> => {
    const nextProfile = await getMe();
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const signIn = useCallback(async (session: SessionResponse): Promise<UserProfile> => {
    await saveSession({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      role: session.role,
    });

    try {
      const nextProfile = await getMe();
      setProfile(nextProfile);
      setAccessToken(session.access_token);
      setPhase('authenticated');
      return nextProfile;
    } catch (error) {
      await clearSession();
      setProfile(null);
      setAccessToken(null);
      setPhase('guest');
      throw error;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await logout();
    } catch {
      // Local token removal is still required if the device is offline.
    } finally {
      await resetToGuest();
    }
  }, [resetToGuest]);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const session = await readSession();
        if (!session) return;

        const nextProfile = await getMe();
        if (!active) return;
        setProfile(nextProfile);
        setAccessToken(session.accessToken);
        setPhase('authenticated');
      } catch {
        await clearSession();
      } finally {
        if (active) setPhase(current => (current === 'authenticated' ? current : 'guest'));
      }
    };

    void restore();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => subscribeToSession(session => {
    setAccessToken(session?.accessToken ?? null);
    if (!session) {
      setProfile(null);
      setPhase(current => (current === 'restoring' ? current : 'guest'));
    }
  }), []);

  const value = useMemo<AuthContextValue>(() => ({
    phase,
    profile,
    accessToken,
    signIn,
    refreshProfile,
    updateCachedProfile: setProfile,
    signOut,
  }), [accessToken, phase, profile, refreshProfile, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
};
