import { Component, HostListener, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AppTooltipDirective } from '../../shared/directives';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

import { SCROLL_CONFIG } from '../../constants/app.constants';

/**
 * Component displaying a "Back to Top" button that appears when scrolling down.
 * Provides smooth scrolling to the top of the page with keyboard accessibility.
 */
@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [AppTooltipDirective, TranslatePipe],
  templateUrl: './back-to-top.html',
  styleUrl: './back-to-top.scss',
})
export class BackToTop {
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly isVisible = signal(false);
  private readonly scrollThreshold = SCROLL_CONFIG.BACK_TO_TOP_THRESHOLD;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      this.isVisible.set(scrollPosition > this.scrollThreshold);
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
   * Handle keyboard navigation for accessibility.
   * Triggers scroll on Enter or Space key.
   *
   * @param event - Keyboard event
   */
  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.scrollToTop();
    }
  }
}
