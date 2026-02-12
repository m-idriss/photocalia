import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Privacy } from './privacy';

describe('Privacy', () => {
  let component: Privacy;
  let fixture: ComponentFixture<Privacy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Privacy]
    }).compileComponents();

    fixture = TestBed.createComponent(Privacy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render privacy policy title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Privacy Policy');
  });

  it('should contain GDPR rights section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('Your Rights (GDPR)');
    expect(content).toContain('Right to Access');
  });

  it('should mention OpenAI data processing', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('OpenAI');
    expect(content).toContain('GPT-4 Vision');
  });

  it('should mention Firebase data processing', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('Firebase');
  });

  it('should include contact information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('privacy@photocalia.com');
  });
});
