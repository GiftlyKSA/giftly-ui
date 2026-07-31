import React, { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthProvider';

/** Clears account-scoped server data when the local session ends. */
export const AuthCacheBoundary: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { phase } = useAuth();
  const queryClient = useQueryClient();
  const previousPhase = useRef(phase);

  useEffect(() => {
    if (phase === 'guest' && previousPhase.current !== 'guest' && previousPhase.current !== 'restoring') {
      queryClient.clear();
    }
    previousPhase.current = phase;
  }, [phase, queryClient]);

  return <>{children}</>;
};
