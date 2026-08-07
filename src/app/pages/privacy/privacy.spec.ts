import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Privacy } from './privacy';

describe('Privacy', () => {
  let component: Privacy;
  let fixture: ComponentFixture<Privacy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Privacy],
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

  it('should contain data rights', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('Your rights');
    expect(content).toContain('request access');
  });

  it('should describe the configured AI processors without a fixed model claim', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('Google');
    expect(content).toContain('Anthropic');
    expect(content).toContain('selected server-side');
  });

  it('should mention Firebase and Notion data processing', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('Firebase');
    expect(content).toContain('Notion');
    expect(content).toContain('email');
  });

  it('should include contact information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('privacy@photocalia.com');
  });
});
