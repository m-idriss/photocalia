import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { HowItWorks } from './how-it-works';
import { LanguageService } from '../../services/language.service';

function createLanguageServiceStub(): Pick<
  LanguageService,
  'currentLang' | 'translations' | 'translate' | 'localizeRoute' | 'setLanguage' | 'languages'
> {
  return {
    currentLang: signal<'en' | 'fr'>('en'),
    translations: signal<Record<string, string>>({}),
    translate: (key: string) => key,
    localizeRoute: (path: string) => path,
    setLanguage: () => undefined,
    languages: [],
  };
}

describe('HowItWorks', () => {
  let component: HowItWorks;
  let fixture: ComponentFixture<HowItWorks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HowItWorks],
      providers: [
        provideRouter([]),
        { provide: LanguageService, useValue: createLanguageServiceStub() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HowItWorks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the main page sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.hero-section')).toBeTruthy();
    expect(compiled.querySelector('.intro-section')).toBeTruthy();
    expect(compiled.querySelector('.ai-steps-section')).toBeTruthy();
    expect(compiled.querySelector('.use-cases-section')).toBeTruthy();
    expect(compiled.querySelector('.instant-capture-section')).toBeTruthy();
    expect(compiled.querySelector('.benefits-section')).toBeTruthy();
    expect(compiled.querySelector('.faq-section')).toBeTruthy();
    expect(compiled.querySelector('.cta-section')).toBeTruthy();
  });

  it('should render the expected counts for steps, use cases, and FAQ items', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.ai-step-item').length).toBe(3);
    expect(compiled.querySelectorAll('.use-case-item').length).toBe(5);
    expect(compiled.querySelectorAll('.faq-item').length).toBe(6);
  });

  it('should render the hero and CTA translation keys with the stub translator', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('#hero-title')?.textContent).toContain('howitworks.hero.title');
    expect(compiled.querySelector('.cta-button')?.textContent).toContain('howitworks.cta.button');
  });

  it('should render a CTA button pointing back to the home route', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ctaButton = compiled.querySelector('.cta-button') as HTMLAnchorElement | null;

    expect(ctaButton).toBeTruthy();
    expect(ctaButton?.getAttribute('href')).toBe('/');
  });
});
