import { Component, HostListener, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AppTooltipDirective } from '../../shared/directives';

import { SCROLL_CONFIG } from '../../constants/app.constants';

/**
 * Component displaying "Back to Top" and "Go to Bottom" buttons.
 * - "Go to Top" appears when scrolled past the threshold.
 * - "Go to Bottom" appears when near the top (i.e. top button is not visible).
 */
@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [AppTooltipDirective],
  templateUrl: './back-to-top.html',
  styleUrl: './back-to-top.scss',
})
export class BackToTop {
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly isTopVisible = signal(false);
  protected readonly isBottomVisible = signal(true);
  private readonly scrollThreshold = SCROLL_CONFIG.BACK_TO_TOP_THRESHOLD;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      const scrolledDown = scrollPosition > this.scrollThreshold;
      this.isTopVisible.set(scrolledDown);
      this.isBottomVisible.set(!scrolledDown);
    }
  }

  /**
   * Scroll smoothly to the top of the page.
   */
  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  /**
   * Scroll smoothly to the bottom of the page.
   */
  scrollToBottom(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  /**
   * Handle keyboard navigation for the top button.
   */
  handleKeyPressTop(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.scrollToTop();
    }
  }

  /**
   * Handle keyboard navigation for the bottom button.
   */
  handleKeyPressBottom(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.scrollToBottom();
    }
  }
}
