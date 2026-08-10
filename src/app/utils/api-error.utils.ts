import { ApiClientError, ApiErrorCode, API_ERROR_CODES } from '../models/api-error.model';

type UnknownRecord = Record<string, unknown>;

const STATUS_CODES: Readonly<Record<number, ApiErrorCode>> = {
  400: 'INVALID_REQUEST',
  401: 'AUTHENTICATION_REQUIRED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  429: 'QUOTA_EXCEEDED',
  500: 'SERVICE_UNAVAILABLE',
  502: 'SERVICE_UNAVAILABLE',
  503: 'SERVICE_UNAVAILABLE',
  504: 'SERVICE_UNAVAILABLE',
};

const MESSAGE_KEYS: Readonly<Record<ApiErrorCode, string>> = {
  INVALID_REQUEST: 'api.error.invalid_request',
  AUTHENTICATION_REQUIRED: 'api.error.authentication_required',
  FORBIDDEN: 'api.error.forbidden',
  NOT_FOUND: 'api.error.not_found',
  CONFLICT: 'api.error.conflict',
  QUOTA_EXCEEDED: 'api.error.quota_exceeded',
  RATE_LIMITED: 'api.error.rate_limited',
  PROCESSING_ERROR: 'api.error.processing_error',
  SERVICE_UNAVAILABLE: 'api.error.service_unavailable',
  NETWORK_ERROR: 'api.error.network_error',
  UNKNOWN: 'api.error.unknown',
};

const knownCodes = new Set<string>(API_ERROR_CODES);

const BACKEND_CODE_MAP: Readonly<Record<string, ApiErrorCode>> = {
  VALIDATION_ERROR: 'INVALID_REQUEST',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  IDEMPOTENCY_CONFLICT: 'CONFLICT',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMITED',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  EXTERNAL_SERVICE_ERROR: 'SERVICE_UNAVAILABLE',
  DATASTORE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'SERVICE_UNAVAILABLE',
};

export function toApiClientError(error: unknown): ApiClientError {
  const root = asRecord(error);
  const payload = asRecord(root?.['error']);
  const status = readStatus(root);
  const suppliedCode =
    readString(payload, 'errorCode') ??
    readString(payload, 'code') ??
    readString(root, 'errorCode') ??
    readString(root, 'code');
  const code = normalizeCode(suppliedCode) ?? codeFromStatus(status);

  return {
    code,
    messageKey: MESSAGE_KEYS[code],
    status,
    correlationId:
      readString(payload, 'correlationId') ??
      readString(payload, 'requestId') ??
      readString(root, 'correlationId') ??
      readString(root, 'requestId') ??
      null,
  };
}

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null ? (value as UnknownRecord) : null;
}

function readStatus(record: UnknownRecord | null): number | null {
  const status = record?.['status'];
  return typeof status === 'number' && Number.isInteger(status) ? status : null;
}

function readString(record: UnknownRecord | null, key: string): string | null {
  const value = record?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizeCode(value: string | null): ApiErrorCode | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase().replaceAll('-', '_');
  if (BACKEND_CODE_MAP[normalized]) return BACKEND_CODE_MAP[normalized];
  return knownCodes.has(normalized) ? (normalized as ApiErrorCode) : null;
}

function codeFromStatus(status: number | null): ApiErrorCode {
  if (status === 0) return 'NETWORK_ERROR';
  return status === null ? 'UNKNOWN' : (STATUS_CODES[status] ?? 'UNKNOWN');
}
