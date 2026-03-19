import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GithubService } from '../../services/github.service';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { environment } from '../../../environments/environment';

/**
 * Footer link interface for type safety
 */
export interface FooterLink {
  label: string;
  url: string;
  isInternal?: boolean;
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
 * Fetches version dynamically from GitHub releases API for maintainability.
 * Links are conditionally rendered based on environment configuration.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LocalizeRoutePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  private readonly githubService = inject(GithubService);

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

    // Fetch actual release data from backend API to get the GitHub release URL
    this.githubService.getLatestRelease().subscribe({
      next: (release) => {
        if (release?.tag_name) {
          this.appVersion = release.tag_name;
          if (release.html_url) {
            this.releaseUrl = release.html_url;
          }
        }
      },
      error: (err) => {
        console.warn('Failed to fetch release version, keeping environment version:', err);
      },
    });
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
      { label: 'Home', url: '/', isInternal: true },
      { label: 'About Us', url: '/about', isInternal: true },
      { label: 'How It Works', url: '/how-it-works', isInternal: true },
      { label: 'Blog', url: '/blog', isInternal: true },
    ];
    if (config.enableAboutMeLink) {
      productLinks.push({ label: 'About Me', url: '/me', isInternal: true });
    }

    const featureLinks: FooterLink[] = [
      { label: 'AI Text Extraction', url: '/how-it-works', isInternal: true },
      { label: 'Instant ICS Generation', url: '/how-it-works', isInternal: true },
      { label: 'Privacy-First Parsing', url: '/privacy', isInternal: true },
      { label: 'Batch Processing', url: '/how-it-works', isInternal: true },
    ];

    const useCasesLinks: FooterLink[] = [
      { label: 'Medical Appointments', url: '/how-it-works', isInternal: true },
      { label: 'School Schedules', url: '/how-it-works', isInternal: true },
      { label: 'Event Tickets', url: '/how-it-works', isInternal: true },
      { label: 'Delivery Tracking', url: '/how-it-works', isInternal: true },
    ];

    const supportLinks: FooterLink[] = [
      { label: 'FAQ', url: '/how-it-works', isInternal: true },
      { label: 'Contact Us', url: '/about', isInternal: true },
      { label: 'Help Center', url: '/how-it-works', isInternal: true },
    ];

    const resourceLinks: FooterLink[] = [];
    if (config.enableRepositoryLink) {
      resourceLinks.push({ label: 'Repository', url: this.githubRepo });
    }
    if (config.enableIssuesLink) {
      resourceLinks.push({ label: 'Issues', url: `${this.githubRepo}/issues` });
    }
    if (config.enableDocsLink) {
      resourceLinks.push({ label: 'Documentation', url: `${this.githubRepo}/blob/main/README.md` });
    }
    if (config.enableCommunityLink) {
      resourceLinks.push({
        label: 'Community',
        url: `${this.githubRepo}/blob/main/CONTRIBUTING.md`,
      });
    }
    if (config.enableDiscussionsLink) {
      resourceLinks.push({ label: 'Discussions', url: `${this.githubRepo}/discussions` });
    }

    const legalLinks: FooterLink[] = [];
    if (config.enablePrivacyLink) {
      legalLinks.push({ label: 'Privacy Policy', url: '/privacy', isInternal: true });
    }
    if (config.enableTermsLink) {
      legalLinks.push({ label: 'Terms of Service', url: '/terms', isInternal: true });
    }
    if (config.enableLegalMentionsLink) {
      legalLinks.push({ label: 'Legal Mentions', url: '/legal-mentions', isInternal: true });
    }
    if (config.enableLicenseLink) {
      legalLinks.push({ label: 'License', url: `${this.githubRepo}/blob/main/LICENSE` });
    }
    if (config.enableSecurityLink) {
      legalLinks.push({ label: 'Security', url: `${this.githubRepo}/blob/main/SECURITY.md` });
    }

    const sections: FooterSection[] = [];
    if (productLinks.length > 0) sections.push({ title: 'Product', links: productLinks });
    if (featureLinks.length > 0) sections.push({ title: 'Top Features', links: featureLinks });
    if (useCasesLinks.length > 0) sections.push({ title: 'Use Cases', links: useCasesLinks });
    if (supportLinks.length > 0) sections.push({ title: 'Support', links: supportLinks });
    if (resourceLinks.length > 0) sections.push({ title: 'Resources', links: resourceLinks });
    if (legalLinks.length > 0) sections.push({ title: 'Legal', links: legalLinks });

    return sections;
  }

  /**
   * Builds social media links for the footer
   */
  private buildSocialLinks(): SocialLink[] {
    return [{ iconClass: 'fab fa-github', url: this.githubRepo, label: 'GitHub' }];
  }
}
