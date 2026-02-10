import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HowItWorks } from './how-it-works';

describe('HowItWorks', () => {
  let component: HowItWorks;
  let fixture: ComponentFixture<HowItWorks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HowItWorks],
    }).compileComponents();

    fixture = TestBed.createComponent(HowItWorks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the hero title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#hero-title')?.textContent).toContain('How It Works');
  });

  it('should render all 8 main sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    // 1. Hero
    expect(compiled.querySelector('.hero-section')).toBeTruthy();
    
    // 2. Intro
    expect(compiled.querySelector('.intro-section')).toBeTruthy();
    
    // 3. AI Steps
    expect(compiled.querySelector('.ai-steps-section')).toBeTruthy();
    
    // 4. ICS Import
    expect(compiled.querySelector('.ics-import-section')).toBeTruthy();
    
    // 5. Use Cases
    expect(compiled.querySelector('.use-cases-section')).toBeTruthy();
    
    // 6. Instant Capture
    expect(compiled.querySelector('.instant-capture-section')).toBeTruthy();
    
    // 7. Benefits
    expect(compiled.querySelector('.benefits-section')).toBeTruthy();
    
    // 8. FAQ
    expect(compiled.querySelector('.faq-section')).toBeTruthy();
  });

  it('should render 4 AI steps', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const steps = compiled.querySelectorAll('.ai-step-item');
    expect(steps.length).toBe(4);
  });

  it('should render 5 use cases', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const useCases = compiled.querySelectorAll('.use-case-item');
    expect(useCases.length).toBe(5);
  });

  it('should render 6 FAQ items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const faqItems = compiled.querySelectorAll('.faq-item');
    expect(faqItems.length).toBe(6);
  });

  it('should have CTA section with link to home', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ctaButton = compiled.querySelector('.cta-button') as HTMLAnchorElement;
    expect(ctaButton).toBeTruthy();
    expect(ctaButton.getAttribute('href')).toBe('/');
  });
});
