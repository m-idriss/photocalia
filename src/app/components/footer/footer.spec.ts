import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { Footer, FooterLink } from './footer';
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
      of({
        tag_name: 'v1.0.0',
        html_url: 'https://github.com/m-idriss/photocalia/releases/tag/v1.0.0',
      }),
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

  function getAllLinks(): FooterLink[] {
    return component.footerSections.reduce(
      (acc, section) => acc.concat(section.links),
      [] as FooterLink[],
    );
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build footer sections based on environment configuration', () => {
    expect(component.footerSections).toBeDefined();
    expect(Array.isArray(component.footerSections)).toBe(true);
  });

  it('should include License link when enabled in config', () => {
    const allLinks = getAllLinks();
    const licenseLink = allLinks.find((link) => link.label === 'License');
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
    const allLinks = getAllLinks();

    // Check each link type matches config
    const hasRepository = allLinks.some((link) => link.label === 'Repository');
    expect(hasRepository).toBe(config.enableRepositoryLink);

    const hasIssues = allLinks.some((link) => link.label === 'Issues');
    expect(hasIssues).toBe(config.enableIssuesLink);

    const hasDocs = allLinks.some((link) => link.label === 'Documentation');
    expect(hasDocs).toBe(config.enableDocsLink);

    const hasLicense = allLinks.some((link) => link.label === 'License');
    expect(hasLicense).toBe(config.enableLicenseLink);

    const hasSecurity = allLinks.some((link) => link.label === 'Security');
    expect(hasSecurity).toBe(config.enableSecurityLink);

    const hasCommunity = allLinks.some((link) => link.label === 'Community');
    expect(hasCommunity).toBe(config.enableCommunityLink);

    const hasDiscussions = allLinks.some((link) => link.label === 'Discussions');
    expect(hasDiscussions).toBe(config.enableDiscussionsLink);

    const hasAboutMe = allLinks.some((link) => link.label === 'About Me');
    expect(hasAboutMe).toBe(config.enableAboutMeLink);

    const hasPrivacy = allLinks.some((link) => link.label === 'Privacy Policy');
    expect(hasPrivacy).toBe(config.enablePrivacyLink ?? true);

    const hasTerms = allLinks.some((link) => link.label === 'Terms of Service');
    expect(hasTerms).toBe(config.enableTermsLink ?? true);

    const hasLegal = allLinks.some((link) => link.label === 'Legal Mentions');
    expect(hasLegal).toBe(config.enableLegalMentionsLink ?? true);
  });

  it('should mark About Me link as internal when enabled', () => {
    const allLinks = getAllLinks();
    const aboutMeLink = allLinks.find((link) => link.label === 'About Me');
    if (aboutMeLink) {
      expect(aboutMeLink.isInternal).toBe(true);
      expect(aboutMeLink.url).toBe('/me');
    }
  });

  it('should mark legal pages as internal links', () => {
    const allLinks = getAllLinks();
    const privacyLink = allLinks.find((link) => link.label === 'Privacy Policy');
    if (privacyLink) {
      expect(privacyLink.isInternal).toBe(true);
      expect(privacyLink.url).toBe('/privacy');
    }

    const termsLink = allLinks.find((link) => link.label === 'Terms of Service');
    if (termsLink) {
      expect(termsLink.isInternal).toBe(true);
      expect(termsLink.url).toBe('/terms');
    }

    const legalLink = allLinks.find((link) => link.label === 'Legal Mentions');
    if (legalLink) {
      expect(legalLink.isInternal).toBe(true);
      expect(legalLink.url).toBe('/legal-mentions');
    }
  });

  it('should mark external links without isInternal flag', () => {
    const allLinks = getAllLinks();
    const externalLinks = allLinks.filter((link) => !link.isInternal);
    externalLinks.forEach((link) => {
      if (link.url !== '/') {
        // External links might be full github repo URLs
        expect(link.url).toMatch(/^https?:\/\//);
      }
    });
  });

  it('should build social links correctly', () => {
    expect(component.socialLinks.length).toBeGreaterThan(0);
    expect(component.socialLinks[0].iconClass).toBeDefined();
    expect(component.socialLinks[0].url).toBeDefined();
  });
});
