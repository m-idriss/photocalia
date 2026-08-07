export const API_ERROR_CODES = [
  'INVALID_REQUEST',
  'AUTHENTICATION_REQUIRED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'QUOTA_EXCEEDED',
  'RATE_LIMITED',
  'SERVICE_UNAVAILABLE',
  'NETWORK_ERROR',
  'UNKNOWN',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface ApiClientError {
  code: ApiErrorCode;
  messageKey: string;
  status: number | null;
  correlationId: string | null;
}
