import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegalMentions } from './legal-mentions';

describe('LegalMentions', () => {
  let component: LegalMentions;
  let fixture: ComponentFixture<LegalMentions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalMentions]
    }).compileComponents();

    fixture = TestBed.createComponent(LegalMentions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render legal mentions title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Legal Mentions');
  });

  it('should include hosting provider information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('Firebase Hosting');
    expect(content).toContain('Google Cloud Platform');
  });

  it('should mention open source license', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('MIT License');
    expect(content).toContain('Open Source');
  });

  it('should include contact information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('support@photocalia.com');
  });

  it('should reference GDPR compliance', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.textContent || '';
    expect(content).toContain('GDPR');
  });
});
