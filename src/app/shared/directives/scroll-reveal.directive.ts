import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  NgZone,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
  host: {
    '[class.scroll-reveal]': 'true',
    '[class.scroll-reveal--visible]': 'isVisible()',
  },
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private observer?: IntersectionObserver;

  @Input() appScrollRevealDelay = 0;
  @Input() appScrollRevealDirection: 'up' | 'down' | 'left' | 'right' = 'up';

  protected readonly isVisible = signal(false);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isVisible.set(true);
      return;
    }

    const element = this.el.nativeElement as HTMLElement;
    element.style.setProperty('--scroll-reveal-delay', `${this.appScrollRevealDelay}ms`);
    element.classList.add(`scroll-reveal--${this.appScrollRevealDirection}`);

    if (typeof IntersectionObserver === 'undefined') {
      this.isVisible.set(true);
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.ngZone.run(() => this.isVisible.set(true));
          this.observer?.unobserve(element);
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px -10% 0px' },
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
