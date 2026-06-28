import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { Footer, FooterLink } from './footer';
import { GithubService } from '../../services/github.service';
import { CookieConsentService } from '../../services/cookie-consent.service';
import { environment } from '../../../environments/environment';
import { version as packageVersion } from '../../../../package.json';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;
  let mockGithubService: jasmine.SpyObj<GithubService>;
  let mockCookieConsentService: jasmine.SpyObj<CookieConsentService>;

  beforeEach(async () => {
    // Create a mock GithubService to avoid external HTTP calls
    mockGithubService = jasmine.createSpyObj('GithubService', ['getLatestRelease']);
    mockGithubService.getLatestRelease.and.returnValue(
      of({
        tag_name: 'v1.0.0',
        html_url: 'https://github.com/m-idriss/photocalia/releases/tag/v1.0.0',
      }),
    );
    mockCookieConsentService = jasmine.createSpyObj('CookieConsentService', ['open']);

    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: GithubService, useValue: mockGithubService },
        { provide: CookieConsentService, useValue: mockCookieConsentService },
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

  function findLink(label: string): FooterLink | undefined {
    return getAllLinks().find((link) => link.label === label);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should link the displayed package version to its matching release', () => {
    expect(component.appVersion).toBe(packageVersion);
    expect(component.releaseUrl).toBe(
      `https://github.com/m-idriss/photocalia/releases/tag/v${packageVersion}`,
    );
  });

  it('should build footer sections based on environment configuration', () => {
    expect(component.footerSections).toBeDefined();
    expect(Array.isArray(component.footerSections)).toBe(true);
  });

  it('should include License link when enabled in config', () => {
    const licenseLink = findLink('footer.link.license');

    if (environment.footer.enableLicenseLink) {
      expect(licenseLink).toBeTruthy();
      expect(licenseLink?.url).toContain('/blob/main/LICENSE');
    } else {
      expect(licenseLink).toBeUndefined();
    }
  });

  it('should only include links enabled in environment config', () => {
    const config = environment.footer;

    const hasRepository = !!findLink('footer.link.repository');
    expect(hasRepository).toBe(config.enableRepositoryLink);

    const hasIssues = !!findLink('footer.link.issues');
    expect(hasIssues).toBe(config.enableIssuesLink);

    const hasDocs = !!findLink('footer.link.documentation');
    expect(hasDocs).toBe(config.enableDocsLink);

    const hasLicense = !!findLink('footer.link.license');
    expect(hasLicense).toBe(config.enableLicenseLink);

    const hasSecurity = !!findLink('footer.link.security');
    expect(hasSecurity).toBe(config.enableSecurityLink);

    const hasCommunity = !!findLink('footer.link.community');
    expect(hasCommunity).toBe(config.enableCommunityLink);

    const hasDiscussions = !!findLink('footer.link.discussions');
    expect(hasDiscussions).toBe(config.enableDiscussionsLink);

    const hasAboutMe = !!findLink('footer.link.aboutMe');
    expect(hasAboutMe).toBe(config.enableAboutMeLink);

    const hasPrivacy = !!findLink('footer.link.privacyPolicy');
    expect(hasPrivacy).toBe(config.enablePrivacyLink ?? true);

    const hasTerms = !!findLink('footer.link.termsOfService');
    expect(hasTerms).toBe(config.enableTermsLink ?? true);

    const hasLegal = !!findLink('footer.link.legalMentions');
    expect(hasLegal).toBe(config.enableLegalMentionsLink ?? true);
  });

  it('should mark About Me link as internal when enabled', () => {
    const aboutMeLink = findLink('footer.link.aboutMe');
    if (aboutMeLink) {
      expect(aboutMeLink.isInternal).toBe(true);
      expect(aboutMeLink.url).toBe('/me');
    } else {
      expect(environment.footer.enableAboutMeLink).toBe(false);
    }
  });

  it('should mark legal pages as internal links', () => {
    const privacyLink = findLink('footer.link.privacyPolicy');
    if (privacyLink) {
      expect(privacyLink.isInternal).toBe(true);
      expect(privacyLink.url).toBe('/privacy');
    }

    const termsLink = findLink('footer.link.termsOfService');
    if (termsLink) {
      expect(termsLink.isInternal).toBe(true);
      expect(termsLink.url).toBe('/terms');
    }

    const legalLink = findLink('footer.link.legalMentions');
    if (legalLink) {
      expect(legalLink.isInternal).toBe(true);
      expect(legalLink.url).toBe('/legal-mentions');
    }
  });

  it('should mark external links without isInternal flag', () => {
    const externalLinks = getAllLinks().filter(
      (link) => !link.isInternal && !link.action && !!link.url,
    );

    externalLinks.forEach((link) => {
      expect(link.url).toMatch(/^https?:\/\//);
    });
  });

  it('should include cookie preferences as an action link', () => {
    const cookieLink = findLink('footer.link.cookiePreferences');

    expect(cookieLink).toEqual(
      jasmine.objectContaining({
        label: 'footer.link.cookiePreferences',
        action: 'cookie',
      }),
    );
    expect(cookieLink?.url).toBeUndefined();
  });

  it('should open cookie preferences when the cookie action is handled', () => {
    component.handleLinkAction('cookie');

    expect(mockCookieConsentService.open).toHaveBeenCalled();
  });

  it('should build social links correctly', () => {
    expect(component.socialLinks.length).toBeGreaterThan(0);
    expect(component.socialLinks[0].iconClass).toBeDefined();
    expect(component.socialLinks[0].url).toBeDefined();
  });
});
