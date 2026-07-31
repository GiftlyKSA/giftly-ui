import { clearSession, getMemorySession, saveSession } from '../auth/secureSession';
import { ApiErrorBody, SessionResponse } from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly retryAfter?: number;

  constructor(options: {
    status: number;
    code?: string;
    message?: string;
    requestId?: string;
    retryAfter?: number;
  }) {
    super(options.message || 'Unable to complete the request.');
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code || 'UNKNOWN_ERROR';
    this.requestId = options.requestId;
    this.retryAfter = options.retryAfter;
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown;
  authenticated?: boolean;
  retryUnauthorized?: boolean;
  headers?: Record<string, string>;
};

let refreshPromise: Promise<void> | null = null;

const getOrigin = (): string => {
  const configuredOrigin = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!configuredOrigin) {
    throw new ApiError({
      status: 0,
      code: 'API_CONFIGURATION_MISSING',
      message: 'The app is missing EXPO_PUBLIC_API_URL.',
    });
  }

  const origin = configuredOrigin.replace(/\/+$/, '');
  if (!__DEV__ && !origin.startsWith('https://')) {
    throw new ApiError({
      status: 0,
      code: 'INSECURE_API_URL',
      message: 'A production API URL must use HTTPS.',
    });
  }
  return origin;
};

const makeUrl = (path: string): string => {
  if (!path.startsWith('/')) {
    throw new ApiError({ status: 0, code: 'INVALID_API_PATH', message: 'Invalid API path.' });
  }
  return `${getOrigin()}${path}`;
};

export const getWebSocketUrl = (path: string): string => {
  const httpUrl = makeUrl(path);
  return httpUrl.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
};

const parseJson = async <T>(response: Response): Promise<T | undefined> => {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
};

const requestOnce = async <T>(
  path: string,
  options: ApiRequestOptions,
): Promise<T> => {
  const { body, authenticated = true, headers, retryUnauthorized: _retryUnauthorized, ...requestInit } = options;
  const session = authenticated ? getMemorySession() : null;

  if (authenticated && !session) {
    throw new ApiError({ status: 401, code: 'UNAUTHORIZED', message: 'Please sign in again.' });
  }

  const response = await fetch(makeUrl(path), {
    ...requestInit,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await parseJson<T | ApiErrorBody>(response);
  if (!response.ok) {
    const apiError = payload as ApiErrorBody | undefined;
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;
    throw new ApiError({
      status: response.status,
      code: apiError?.error?.code,
      message: apiError?.error?.message,
      requestId: apiError?.error?.request_id ?? response.headers.get('X-Request-ID') ?? undefined,
      retryAfter: Number.isFinite(retryAfter) ? retryAfter : undefined,
    });
  }

  return payload as T;
};

const refreshTokens = async (): Promise<void> => {
  if (refreshPromise) return refreshPromise;

  const session = getMemorySession();
  if (!session) {
    throw new ApiError({ status: 401, code: 'UNAUTHORIZED', message: 'Please sign in again.' });
  }

  refreshPromise = requestOnce<SessionResponse>('/api/auth/refresh', {
    method: 'POST',
    authenticated: false,
    body: { refresh_token: session.refreshToken },
  })
    .then(async refreshed => {
      await saveSession({
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token,
        role: refreshed.role,
      });
    })
    .catch(async error => {
      await clearSession();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { authenticated = true, retryUnauthorized = true } = options;

  try {
    return await requestOnce<T>(path, options);
  } catch (error) {
    if (
      error instanceof ApiError
      && authenticated
      && retryUnauthorized
      && error.status === 401
      && error.code === 'UNAUTHORIZED'
    ) {
      await refreshTokens();
      return requestOnce<T>(path, { ...options, retryUnauthorized: false });
    }
    throw error;
  }
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.name === 'AbortError') return '';
  return 'Unable to complete the request. Please try again.';
};
