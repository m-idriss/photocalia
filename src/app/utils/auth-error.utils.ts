const AUTH_MESSAGES: Readonly<Record<string, string>> = {
  'auth/unauthorized-domain': 'auth.error.unauthorizedDomain',
  'auth/popup-blocked': 'auth.error.popupBlocked',
  'auth/popup-closed-by-user': 'auth.error.cancelled',
  'auth/cancelled-popup-request': 'auth.error.cancelled',
  'auth/network-request-failed': 'auth.error.network',
  'auth/operation-not-allowed': 'auth.error.unavailable',
};

/** Firebase errors may be wrapped in an Error with the original SDK error as its cause. */
export function authErrorMessageKey(error: unknown): string {
  let current = error;
  for (let depth = 0; depth < 5 && typeof current === 'object' && current !== null; depth++) {
    const details = current as { code?: unknown; cause?: unknown };
    if (typeof details.code === 'string' && AUTH_MESSAGES[details.code]) {
      return AUTH_MESSAGES[details.code];
    }
    current = details.cause;
  }
  return 'auth.error.unknown';
}
