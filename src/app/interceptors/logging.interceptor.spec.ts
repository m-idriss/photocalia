import { safeRequestPath } from './logging.interceptor';

describe('safeRequestPath', () => {
  it('removes query strings containing user identifiers', () => {
    expect(
      safeRequestPath(
        'https://api.photocalia.com/v1/converter/quota-status?userId=person%40example.com',
      ),
    ).toBe('/v1/converter/quota-status');
  });

  it('keeps relative paths without their query string', () => {
    expect(safeRequestPath('/assets/i18n/en.json?v=1')).toBe('/assets/i18n/en.json');
  });
});
