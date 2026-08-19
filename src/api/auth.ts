import { apiRequest } from './client';
import { RegistrationForm, SendOtpResponse, SessionResponse, VerifyOtpResponse } from './types';

export const sendOtp = (phone: string, signal?: AbortSignal): Promise<SendOtpResponse> =>
  apiRequest('/api/auth/send-otp', {
    method: 'POST',
    authenticated: false,
    body: { phone },
    signal,
  });

export const verifyOtp = (
  phone: string,
  otp: string,
  signal?: AbortSignal,
): Promise<VerifyOtpResponse> =>
  apiRequest('/api/auth/verify-otp', {
    method: 'POST',
    authenticated: false,
    body: { phone, otp },
    signal,
  });

export const register = (
  registrationToken: string,
  form: RegistrationForm,
  signal?: AbortSignal,
): Promise<SessionResponse> =>
  apiRequest('/api/auth/register', {
    method: 'POST',
    authenticated: false,
    body: { registration_token: registrationToken, ...form },
    signal,
  });

export const logout = (): Promise<void> =>
  apiRequest('/api/auth/logout', { method: 'POST' });
