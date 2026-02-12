import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { Footer } from './footer';
import { GithubService } from '../../services/github.service';
import { environment } from '../../../environments/environment';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;
  let mockGithubService: jasmine.SpyObj<GithubService>;

  beforeEach(async () => {
    // Create a mock GithubService to avoid external HTTP calls
    mockGithubService = jasmine.createSpyObj('GithubService', ['getLatestRelease']);
    mockGithubService.getLatestRelease.and.returnValue(
      of({ tag_name: 'v1.0.0', html_url: 'https://github.com/m-idriss/photocalia/releases/tag/v1.0.0' })
    );

    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: GithubService, useValue: mockGithubService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build footer links based on environment configuration', () => {
    expect(component.footerLinks).toBeDefined();
    expect(Array.isArray(component.footerLinks)).toBe(true);
  });

  it('should include License link when enabled in config', () => {
    const licenseLink = component.footerLinks.find((link) => link.label === 'License');
    // License is enabled in the default environment config
    if (environment.footer.enableLicenseLink) {
      expect(licenseLink).toBeTruthy();
      expect(licenseLink?.url).toContain('/LICENSE');
    } else {
      expect(licenseLink).toBeUndefined();
    }
  });

  it('should only include links enabled in environment config', () => {
    const config = environment.footer;
    
    // Check each link type matches config
    const hasRepository = component.footerLinks.some((link) => link.label === 'Repository');
    expect(hasRepository).toBe(config.enableRepositoryLink);

    const hasIssues = component.footerLinks.some((link) => link.label === 'Issues');
    expect(hasIssues).toBe(config.enableIssuesLink);

    const hasDocs = component.footerLinks.some((link) => link.label === 'Docs');
    expect(hasDocs).toBe(config.enableDocsLink);

    const hasLicense = component.footerLinks.some((link) => link.label === 'License');
    expect(hasLicense).toBe(config.enableLicenseLink);

    const hasSecurity = component.footerLinks.some((link) => link.label === 'Security');
    expect(hasSecurity).toBe(config.enableSecurityLink);

    const hasCommunity = component.footerLinks.some((link) => link.label === 'Community');
    expect(hasCommunity).toBe(config.enableCommunityLink);

    const hasDiscussions = component.footerLinks.some((link) => link.label === 'Discussions');
    expect(hasDiscussions).toBe(config.enableDiscussionsLink);

    const hasAboutMe = component.footerLinks.some((link) => link.label === 'About Me');
    expect(hasAboutMe).toBe(config.enableAboutMeLink);

    const hasPrivacy = component.footerLinks.some((link) => link.label === 'Privacy');
    expect(hasPrivacy).toBe(config.enablePrivacyLink ?? true);

    const hasTerms = component.footerLinks.some((link) => link.label === 'Terms');
    expect(hasTerms).toBe(config.enableTermsLink ?? true);

    const hasLegal = component.footerLinks.some((link) => link.label === 'Legal');
    expect(hasLegal).toBe(config.enableLegalMentionsLink ?? true);
  });

  it('should mark About Me link as internal when enabled', () => {
    const aboutMeLink = component.footerLinks.find((link) => link.label === 'About Me');
    if (aboutMeLink) {
      expect(aboutMeLink.isInternal).toBe(true);
      expect(aboutMeLink.url).toBe('/me');
    }
  });

  it('should mark legal pages as internal links', () => {
    const privacyLink = component.footerLinks.find((link) => link.label === 'Privacy');
    if (privacyLink) {
      expect(privacyLink.isInternal).toBe(true);
      expect(privacyLink.url).toBe('/privacy');
    }

    const termsLink = component.footerLinks.find((link) => link.label === 'Terms');
    if (termsLink) {
      expect(termsLink.isInternal).toBe(true);
      expect(termsLink.url).toBe('/terms');
    }

    const legalLink = component.footerLinks.find((link) => link.label === 'Legal');
    if (legalLink) {
      expect(legalLink.isInternal).toBe(true);
      expect(legalLink.url).toBe('/legal-mentions');
    }
  });

  it('should mark external links without isInternal flag', () => {
    const externalLinks = component.footerLinks.filter((link) => !link.isInternal);
    externalLinks.forEach((link) => {
      // External links should have URLs starting with http or be full github repo URLs
      expect(link.url).toMatch(/^https?:\/\//);
    });
  });
});
