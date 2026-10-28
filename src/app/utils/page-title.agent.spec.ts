import { localizedPageTitle } from './page-title.utils';

describe('localizedPageTitle - root and nested French routes preserve locale with queries/fragments', () => {
  const resolver = localizedPageTitle('English Title', 'Titre Français');

  it('should detect exact /fr root path', () => {
    expect(resolver({} as never, { url: '/fr' } as never)).toBe('Titre Français');
  });

  it('should detect /fr with query string', () => {
    expect(resolver({} as never, { url: '/fr?mode=demo' } as never)).toBe('Titre Français');
  });

  it('should detect /fr with fragment', () => {
    expect(resolver({} as never, { url: '/fr#intro' } as never)).toBe('Titre Français');
  });

  it('should detect /fr with query and fragment', () => {
    expect(resolver({} as never, { url: '/fr?mode=demo#intro' } as never)).toBe('Titre Français');
  });

  it('should detect nested French route with query', () => {
    expect(resolver({} as never, { url: '/fr/photo?mode=demo' } as never)).toBe('Titre Français');
  });

  it('should detect nested French route with fragment', () => {
    expect(resolver({} as never, { url: '/fr/photo#intro' } as never)).toBe('Titre Français');
  });

  it('should use English for root English path with query', () => {
    expect(resolver({} as never, { url: '/photo?next=/fr' } as never)).toBe('English Title');
  });

  it('should not detect /france as French locale', () => {
    expect(resolver({} as never, { url: '/france' } as never)).toBe('English Title');
  });

  it('should not detect uppercase /FR as French locale', () => {
    expect(resolver({} as never, { url: '/FR' } as never)).toBe('English Title');
  });

  it('should detect /fr with mixed casing and fragment case sensitive fails', () => {
    expect(resolver({} as never, { url: '/Fr#intro' } as never)).toBe('English Title');
  });
});
