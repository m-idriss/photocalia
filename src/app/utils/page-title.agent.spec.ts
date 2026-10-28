import { localizedPageTitle } from './page-title.utils';

describe("Localized page title routing", () => {
  const resolver = localizedPageTitle("English title", "Localized title");

  it("handles synthetic route case 1", () => {
    expect(resolver({} as never, { url: '/fr' } as never)).toBe("Localized title");
  });

  it("handles synthetic route case 2", () => {
    expect(resolver({} as never, { url: '/fr?mode=demo' } as never)).toBe("Localized title");
  });

  it("handles synthetic route case 3", () => {
    expect(resolver({} as never, { url: '/fr#intro' } as never)).toBe("Localized title");
  });

  it("handles synthetic route case 4", () => {
    expect(resolver({} as never, { url: '/fr?mode=demo#intro' } as never)).toBe("Localized title");
  });

  it("handles synthetic route case 5", () => {
    expect(resolver({} as never, { url: '/fr/photo?mode=demo' } as never)).toBe("Localized title");
  });

  it("handles synthetic route case 6", () => {
    expect(resolver({} as never, { url: '/fr/photo#intro' } as never)).toBe("Localized title");
  });

  it("handles synthetic route case 7", () => {
    expect(resolver({} as never, { url: '/photo?next=/fr' } as never)).toBe("English title");
  });

  it("handles synthetic route case 8", () => {
    expect(resolver({} as never, { url: '/france' } as never)).toBe("English title");
  });

  it("handles synthetic route case 9", () => {
    expect(resolver({} as never, { url: '/FR' } as never)).toBe("English title");
  });

  it("handles synthetic route case 10", () => {
    expect(resolver({} as never, { url: '/Fr#intro' } as never)).toBe("English title");
  });
});
