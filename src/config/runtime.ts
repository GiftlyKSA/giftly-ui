/** Return a development OTP only for an explicitly development-configured UI build. */
export const extractDevelopmentOtp = (
  environment: string | undefined,
  otp: string | null | undefined,
): string | null => (
  environment?.trim() === 'development' && typeof otp === 'string' && /^\d{6}$/.test(otp)
    ? otp
    : null
);
