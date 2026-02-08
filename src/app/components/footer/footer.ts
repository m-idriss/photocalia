import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GithubService } from '../../services/github.service';

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
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  private readonly githubService = inject(GithubService);

  currentYear = new Date().getFullYear();
  appVersion = '0.0.0';
  releaseUrl = '';
  githubRepo = 'https://github.com/m-idriss/3dime-angular';
  authorName = 'Idriss';
  authorProfile = 'https://github.com/m-idriss';

  footerLinks: FooterLink[] = [
  //  { label: 'Repository', url: this.githubRepo },
  //  { label: 'Issues', url: `${this.githubRepo}/issues` },
  //  { label: 'Docs', url: `${this.githubRepo}/blob/main/README.md` },
    { label: 'License', url: `${this.githubRepo}/blob/main/LICENSE` },
  //  { label: 'Security', url: `${this.githubRepo}/blob/main/SECURITY.md` },
  //  { label: 'Community', url: `${this.githubRepo}/blob/main/CONTRIBUTING.md` },
  //  { label: 'Discussions', url: `${this.githubRepo}/discussions` },
    { label: 'About Me', url: '/me', isInternal: true },
  ];

  ngOnInit(): void {
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
}
