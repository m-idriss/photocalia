import { toApiClientError } from './api-error.utils';

describe('toApiClientError', () => {
  it('prefers a documented machine-readable backend code', () => {
    expect(
      toApiClientError({
        status: 400,
        error: { code: 'QUOTA_EXCEEDED', message: 'Text can change', correlationId: 'req-123' },
      }),
    ).toEqual({
      code: 'QUOTA_EXCEEDED',
      messageKey: 'api.error.quota_exceeded',
      status: 400,
      correlationId: 'req-123',
    });
  });

  it('maps the canonical backend errorCode and requestId fields', () => {
    expect(
      toApiClientError({
        status: 409,
        error: { errorCode: 'IDEMPOTENCY_CONFLICT', requestId: 'request-409' },
      }),
    ).toEqual({
      code: 'CONFLICT',
      messageKey: 'api.error.conflict',
      status: 409,
      correlationId: 'request-409',
    });
  });

  it('defines UI behavior for provider and rate-limit codes', () => {
    expect(
      toApiClientError({ status: 502, error: { errorCode: 'EXTERNAL_SERVICE_ERROR' } }).code,
    ).toBe('SERVICE_UNAVAILABLE');
    expect(
      toApiClientError({ status: 429, error: { errorCode: 'RATE_LIMIT_EXCEEDED' } }).code,
    ).toBe('RATE_LIMITED');
  });

  it('keeps an image processing failure distinct from a service outage', () => {
    expect(toApiClientError({ status: 422, error: { errorCode: 'PROCESSING_ERROR' } })).toEqual({
      code: 'PROCESSING_ERROR',
      messageKey: 'api.error.processing_error',
      status: 422,
      correlationId: null,
    });
  });

  it('maps HTTP status without inspecting a human message', () => {
    const result = toApiClientError({ status: 401, error: { message: 'Anything' } });

    expect(result.code).toBe('AUTHENTICATION_REQUIRED');
    expect(result.messageKey).toBe('api.error.authentication_required');
  });

  it('distinguishes network failures from unknown responses', () => {
    expect(toApiClientError({ status: 0 }).code).toBe('NETWORK_ERROR');
    expect(toApiClientError(new Error('local failure')).code).toBe('UNKNOWN');
  });

  it('does not trust undocumented codes', () => {
    expect(toApiClientError({ status: 503, error: { code: 'NEW_UNREVIEWED_CODE' } }).code).toBe(
      'SERVICE_UNAVAILABLE',
    );
  });
});
