import { authErrorMessageKey } from './auth-error.utils';

describe('Google sign-in errors', () => {
  it('keeps the unauthorized-domain explanation through the AuthService wrapper', () => {
    const error = new Error('Sign-in failed', { cause: { code: 'auth/unauthorized-domain' } });
    expect(authErrorMessageKey(error)).toBe('auth.error.unauthorizedDomain');
  });
  it('distinguishes a blocked popup from a cancelled sign-in', () => {
    expect(authErrorMessageKey({ code: 'auth/popup-blocked' })).toBe('auth.error.popupBlocked');
    expect(authErrorMessageKey({ code: 'auth/popup-closed-by-user' })).toBe('auth.error.cancelled');
  });
  it('does not expose raw unexpected error details to the user', () => {
    expect(authErrorMessageKey(new Error('unexpected internal detail'))).toBe('auth.error.unknown');
  });
  it('handles malformed or cyclic causes without looping', () => {
    const error: { cause?: unknown } = {};
    error.cause = error;
    expect(authErrorMessageKey(error)).toBe('auth.error.unknown');
    expect(authErrorMessageKey(null)).toBe('auth.error.unknown');
  });
});
