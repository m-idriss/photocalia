import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CookieConsentService } from '../../services/cookie-consent.service';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { environment } from '../../../environments/environment';

/**
 * Footer link interface for type safety
 */
export interface FooterLink {
  label: string;
  url?: string;
  isInternal?: boolean;
  action?: string;
}

/**
 * Footer section interface for grouped links
 */
export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  iconClass: string;
  url: string;
  label: string;
}

/**
 * Global footer component displaying navigation links, project information, and credits.
 * Uses environment version and a stable release URL to avoid runtime API rate limits.
 * Links are conditionally rendered based on environment configuration.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LocalizeRoutePipe, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  private readonly cookieConsentService = inject(CookieConsentService);

  currentYear = new Date().getFullYear();
  appVersion = environment.appVersion ?? '0.0.0';
  releaseUrl = '';
  githubRepo = 'https://github.com/m-idriss/photocalia';
  authorName = 'Idriss';
  authorProfile = 'https://github.com/m-idriss';

  footerSections: FooterSection[] = [];
  socialLinks: SocialLink[] = [];

  ngOnInit(): void {
    // Build footer sections/links based on environment configuration
    this.footerSections = this.buildFooterSections();
    this.socialLinks = this.buildSocialLinks();

    // Always set a fallback release URL
    this.releaseUrl = `${this.githubRepo}/releases/latest`;
  }

  /**
   * Builds footer sections logically grouped for a fat footer
   */
  private buildFooterSections(): FooterSection[] {
    const config = environment.footer ?? {
      enableRepositoryLink: false,
      enableIssuesLink: false,
      enableDocsLink: false,
      enableLicenseLink: true,
      enableSecurityLink: false,
      enableCommunityLink: false,
      enableDiscussionsLink: false,
      enableAboutMeLink: false,
      enablePrivacyLink: true,
      enableTermsLink: true,
      enableLegalMentionsLink: true,
    };

    const productLinks: FooterLink[] = [
      { label: 'footer.link.home', url: '/', isInternal: true },
      { label: 'footer.link.aboutUs', url: '/about', isInternal: true },
      { label: 'footer.link.howItWorks', url: '/how-it-works', isInternal: true },
      { label: 'footer.link.blog', url: '/blog', isInternal: true },
    ];
    if (config.enableAboutMeLink) {
      productLinks.push({ label: 'footer.link.aboutMe', url: '/me', isInternal: true });
    }

    const featureLinks: FooterLink[] = [
      {
        label: 'footer.link.aiTextExtraction',
        url: '/blog/ai-ocr-calendar-extraction',
        isInternal: true,
      },
      {
        label: 'footer.link.instantIcsGeneration',
        url: '/blog/photo-to-google-calendar',
        isInternal: true,
      },
      { label: 'footer.link.privacyFirstParsing', url: '/privacy', isInternal: true },
      { label: 'footer.link.batchProcessing', url: '/pricing', isInternal: true },
    ];

    const useCasesLinks: FooterLink[] = [
      {
        label: 'footer.link.medicalAppointments',
        url: '/blog/healthcare-appointments',
        isInternal: true,
      },
      {
        label: 'footer.link.schoolSchedules',
        url: '/blog/digitize-paper-schedules',
        isInternal: true,
      },
      { label: 'footer.link.eventTickets', url: '/blog/music-festival-lineup', isInternal: true },
      { label: 'footer.link.examSchedules', url: '/blog/summer-exam-scheduling', isInternal: true },
    ];

    const supportLinks: FooterLink[] = [
      { label: 'footer.link.faq', url: '/how-it-works', isInternal: true },
      { label: 'footer.link.contactUs', url: '/about', isInternal: true },
      { label: 'footer.link.helpCenter', url: '/how-it-works', isInternal: true },
    ];

    const resourceLinks: FooterLink[] = [];
    if (config.enableRepositoryLink) {
      resourceLinks.push({ label: 'footer.link.repository', url: this.githubRepo });
    }
    if (config.enableIssuesLink) {
      resourceLinks.push({ label: 'footer.link.issues', url: `${this.githubRepo}/issues` });
    }
    if (config.enableDocsLink) {
      resourceLinks.push({
        label: 'footer.link.documentation',
        url: `${this.githubRepo}/blob/main/README.md`,
      });
    }
    if (config.enableCommunityLink) {
      resourceLinks.push({
        label: 'footer.link.community',
        url: `${this.githubRepo}/blob/main/CONTRIBUTING.md`,
      });
    }
    if (config.enableDiscussionsLink) {
      resourceLinks.push({
        label: 'footer.link.discussions',
        url: `${this.githubRepo}/discussions`,
      });
    }

    const legalLinks: FooterLink[] = [];
    if (config.enablePrivacyLink) {
      legalLinks.push({ label: 'footer.link.privacyPolicy', url: '/privacy', isInternal: true });
    }
    if (config.enableTermsLink) {
      legalLinks.push({ label: 'footer.link.termsOfService', url: '/terms', isInternal: true });
    }
    if (config.enableLegalMentionsLink) {
      legalLinks.push({
        label: 'footer.link.legalMentions',
        url: '/legal-mentions',
        isInternal: true,
      });
    }
    if (config.enableLicenseLink) {
      legalLinks.push({
        label: 'footer.link.license',
        url: `${this.githubRepo}/blob/main/LICENSE`,
      });
    }
    if (config.enableSecurityLink) {
      legalLinks.push({
        label: 'footer.link.security',
        url: `${this.githubRepo}/blob/main/SECURITY.md`,
      });
    }
    legalLinks.push({ label: 'footer.link.cookiePreferences', action: 'cookie' });

    const sections: FooterSection[] = [];
    if (productLinks.length > 0)
      sections.push({ title: 'footer.section.product', links: productLinks });
    if (featureLinks.length > 0)
      sections.push({ title: 'footer.section.features', links: featureLinks });
    if (useCasesLinks.length > 0)
      sections.push({ title: 'footer.section.useCases', links: useCasesLinks });
    if (supportLinks.length > 0)
      sections.push({ title: 'footer.section.support', links: supportLinks });
    if (resourceLinks.length > 0)
      sections.push({ title: 'footer.section.resources', links: resourceLinks });
    if (legalLinks.length > 0) sections.push({ title: 'footer.section.legal', links: legalLinks });

    return sections;
  }

  openCookiePreferences(): void {
    this.cookieConsentService.open();
  }

  handleLinkAction(action: string): void {
    if (action === 'cookie') {
      this.openCookiePreferences();
    }
  }

  /**
   * Builds social media links for the footer
   */
  private buildSocialLinks(): SocialLink[] {
    return [{ iconClass: 'fab fa-github', url: this.githubRepo, label: 'GitHub' }];
  }
}
