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
  appVersion = '0.0.0';
  releaseUrl = '';
  githubRepo = 'https://github.com/m-idriss/photocalia';
  authorName = 'Idriss';
  authorProfile = 'https://github.com/m-idriss';

  footerLinks: FooterLink[] = [];

  ngOnInit(): void {
    // Build footer links based on environment configuration
    this.footerLinks = this.buildFooterLinks();

    // Always set a fallback release URL
    this.releaseUrl = `${this.githubRepo}/releases/latest`;

    // Fetch actual release data from backend API
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
        console.warn('Failed to fetch release version:', err);
      },
    });
  }

  /**
   * Builds footer links array based on environment configuration flags.
   * Only includes links that are enabled in the environment config.
   * Provides safe defaults when environment.footer is missing (e.g., in production builds).
   */
  private buildFooterLinks(): FooterLink[] {
    const links: FooterLink[] = [];

    // Provide a safe default configuration when environment.footer is missing,
    // e.g., in production builds where the env file is generated without it.
    const defaultConfig = {
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

    const config = environment.footer ?? defaultConfig;

    if (config.enableRepositoryLink) {
      links.push({ label: 'Repository', url: this.githubRepo });
    }
    if (config.enableIssuesLink) {
      links.push({ label: 'Issues', url: `${this.githubRepo}/issues` });
    }
    if (config.enableDocsLink) {
      links.push({ label: 'Docs', url: `${this.githubRepo}/blob/main/README.md` });
    }
    if (config.enableLicenseLink) {
      links.push({ label: 'License', url: `${this.githubRepo}/blob/main/LICENSE` });
    }
    if (config.enableSecurityLink) {
      links.push({ label: 'Security', url: `${this.githubRepo}/blob/main/SECURITY.md` });
    }
    if (config.enableCommunityLink) {
      links.push({ label: 'Community', url: `${this.githubRepo}/blob/main/CONTRIBUTING.md` });
    }
    if (config.enableDiscussionsLink) {
      links.push({ label: 'Discussions', url: `${this.githubRepo}/discussions` });
    }
    if (config.enableAboutMeLink) {
      links.push({ label: 'About Me', url: '/me', isInternal: true });
    }
    // Content links
    links.push({ label: 'Blog', url: '/blog', isInternal: true });

    // Legal compliance links (enabled by default for GDPR compliance)
    if (config.enablePrivacyLink) {
      links.push({ label: 'Privacy', url: '/privacy', isInternal: true });
    }
    if (config.enableTermsLink) {
      links.push({ label: 'Terms', url: '/terms', isInternal: true });
    }
    if (config.enableLegalMentionsLink) {
      links.push({ label: 'Legal', url: '/legal-mentions', isInternal: true });
    }

    return links;
  }
}
