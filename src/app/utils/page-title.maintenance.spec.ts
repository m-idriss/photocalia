import { homePageTitle, pageTitle } from './page-title.utils';

describe('page title literal input boundaries', () => {
  it('keeps the branding separator for an empty page label', () => {
    expect(pageTitle('')).toBe(' | Photocalia');
  });
  it('keeps the branding separator for an empty home description', () => {
    expect(homePageTitle('')).toBe('Photocalia | ');
  });
  it('preserves punctuation in page labels', () => {
    expect(pageTitle('Calendar: 2026 / demo')).toBe('Calendar: 2026 / demo | Photocalia');
  });
  it('preserves punctuation in home descriptions', () => {
    expect(homePageTitle('Photos, PDFs & calendars')).toBe('Photocalia | Photos, PDFs & calendars');
  });
  it('treats a separator in the label as literal input', () => {
    expect(pageTitle('Demo | Preview')).toBe('Demo | Preview | Photocalia');
  });
  it('preserves label whitespace without implicit normalization', () => {
    expect(pageTitle(' Demo ')).toBe(' Demo  | Photocalia');
  });
});
