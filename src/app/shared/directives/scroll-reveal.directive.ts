import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
  host: {
    '[class.scroll-reveal]': 'true',
    '[class.scroll-reveal--visible]': 'isVisible',
  },
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  @Input() appScrollRevealDelay = 0;
  @Input() appScrollRevealDirection: 'up' | 'down' | 'left' | 'right' = 'up';

  protected isVisible = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isVisible = true;
      return;
    }

    const element = this.el.nativeElement as HTMLElement;
    element.style.transitionDelay = `${this.appScrollRevealDelay}ms`;
    element.classList.add(`scroll-reveal--${this.appScrollRevealDirection}`);

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          this.observer?.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
