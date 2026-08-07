import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { Pillar } from './pillar';

describe('Pillar', () => {
  let fixture: ComponentFixture<Pillar>;
  const currentLang = signal<'en' | 'fr'>('en');

  beforeEach(async () => {
    currentLang.set('en');

    await TestBed.configureTestingModule({
      imports: [Pillar],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { pillarSlug: 'photo-to-calendar' } } },
        },
        {
          provide: LanguageService,
          useValue: {
            currentLang,
            localizeRoute: (path: string) => (currentLang() === 'fr' ? `/fr${path}` : path),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Pillar);
    fixture.detectChanges();
  });

  it('renders detailed English content and four FAQs for the primary keyword page', () => {
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('h1')?.textContent).toContain('Photo to calendar converter');
    expect(page.querySelectorAll('.pillar-section').length).toBe(5);
    expect(page.querySelectorAll('.pillar-faq details').length).toBe(4);
  });

  it('renders the localized French content and internal links', () => {
    currentLang.set('fr');
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('h1')?.textContent).toContain('Convertisseur photo vers calendrier');
    expect(page.querySelector('#pillar-faq-title')?.textContent).toContain('Questions fréquentes');
    expect(
      page.querySelector<HTMLAnchorElement>('a[href="/fr/image-to-google-calendar"]'),
    ).toBeTruthy();
  });

  for (const slug of [
    'add-event-to-calendar-from-photo',
    'pdf-to-calendar',
    'ocr-calendar-extraction',
  ]) {
    it(`renders substantial content and FAQs for ${slug}`, () => {
      TestBed.inject(ActivatedRoute).snapshot.data['pillarSlug'] = slug;
      currentLang.set('fr');
      fixture.detectChanges();
      currentLang.set('en');
      fixture.detectChanges();
      const page = fixture.nativeElement as HTMLElement;

      expect(page.querySelectorAll('.pillar-section').length).toBe(5);
      expect(page.querySelectorAll('.pillar-faq details').length).toBe(4);
    });
  }
});
