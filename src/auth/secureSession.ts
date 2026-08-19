import * as SecureStore from 'expo-secure-store';
import { UserRole } from '../api/types';

const SESSION_KEY = 'giftly.session.v1';

export interface Session {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}

let memorySession: Session | null = null;
const listeners = new Set<(session: Session | null) => void>();

const notify = () => {
  listeners.forEach(listener => listener(memorySession));
};

export const getMemorySession = (): Session | null => memorySession;

export const readSession = async (): Promise<Session | null> => {
  if (memorySession) return memorySession;

  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (
      typeof parsed.accessToken !== 'string'
      || typeof parsed.refreshToken !== 'string'
      || (parsed.role !== 'CUSTOMER' && parsed.role !== 'COURIER')
    ) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }

    memorySession = {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      role: parsed.role,
    };
    notify();
    return memorySession;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
};

export const saveSession = async (session: Session): Promise<void> => {
  memorySession = session;
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  notify();
};

export const clearSession = async (): Promise<void> => {
  memorySession = null;
  await SecureStore.deleteItemAsync(SESSION_KEY);
  notify();
};

export const subscribeToSession = (listener: (session: Session | null) => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
