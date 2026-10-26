import {
  Component,
  inject,
  signal,
  computed,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  afterRenderEffect,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbToastModule, NgbProgressbarModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, filter, take } from 'rxjs/operators';

import { Converter } from '../../components/converter/converter';
import { CalendarView } from '../../components/calendar-view';
import { Stats } from '../../components/stats/stats';
import { ToastService } from '../../services/toast.service';
import { CalendarStateService } from '../../services/calendar-state.service';
import { AuthService } from '../../services/auth.service';
import { PlanService } from '../../services/plan.service';
import { LanguageService } from '../../services/language.service';
import { CalendarEvent } from '../../models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { ScrollRevealDirective } from '../../shared/directives';
import { Router, RouterLink, Scroll } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BLOG_ARTICLES, BlogArticle } from '../blog/blog.models';
import { PlanningPreview } from '../../components/planning-preview/planning-preview';
import { RecommendedGuides } from '../../components/recommended-guides/recommended-guides';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Converter,
    PlanningPreview,
    CalendarView,
    Stats,
    NgbToastModule,
    NgbProgressbarModule,
    NgbTooltipModule,
    TranslatePipe,
    LocalizeRoutePipe,
    RouterLink,
    ScrollRevealDirective,
    RecommendedGuides,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  public readonly toastService = inject(ToastService);
  public readonly calendarStateService = inject(CalendarStateService);
  protected readonly authService = inject(AuthService);
  protected readonly planService = inject(PlanService);
  protected readonly languageService = inject(LanguageService);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild(Converter) converterComponent?: Converter;
  protected readonly converterReady = signal(false);
  protected readonly planParams = computed(() => ({ freeLimit: this.planService.freePlanLimit() }));
  protected readonly campaignVideoSrc = computed(
    () => `/assets/videos/photocalia-summer-campaign-${this.languageService.currentLang()}.mp4`,
  );
  protected readonly campaignPosterSrc = computed(
    () =>
      `/assets/videos/photocalia-summer-campaign-${this.languageService.currentLang()}-poster.jpg`,
  );
  protected readonly featuredBlogArticles = [...BLOG_ARTICLES]
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished))
    .slice(0, 8);

  protected readonly isDesktop = signal(false);
  private resizeSubscription?: Subscription;
  private readonly initialRouterScroll = signal<Scroll | null>(null);
  private initialViewportRestored = false;

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event): event is Scroll => event instanceof Scroll),
        take(1),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.initialRouterScroll.set(event));

    afterRenderEffect(() => {
      const scroll = this.initialRouterScroll();
      const initialized = this.authService.isInitialized();
      const connected = this.authService.isAuthenticated();
      const translations = this.languageService.translations();
      if (
        this.initialViewportRestored ||
        !scroll ||
        !initialized ||
        !Object.keys(translations).length
      )
        return;

      const navigation = performance.getEntriesByType('navigation')[0] as
        PerformanceNavigationTiming | undefined;
      const fragment = window.location.hash;
      // Only correct the initial reload of this page; preserve SPA navigation,
      // back/forward restoration, other anchors and the signed-out landing page.
      if (
        scroll.routerEvent.id !== 1 ||
        navigation?.type !== 'reload' ||
        (fragment !== '#converter' && (fragment !== '' || !connected))
      ) {
        this.initialViewportRestored = true;
        return;
      }
      const converter = document.getElementById('converter');
      if (!converter) return;
      this.initialViewportRestored = true;
      const offset = window.innerWidth <= 700 ? 96 : 112;
      window.scrollTo({
        top: Math.max(0, converter.getBoundingClientRect().top + window.scrollY - offset),
        behavior: 'instant',
      });
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize desktop detection
      this.updateDesktopStatus();

      // Listen to window resize with debounce
      this.resizeSubscription = fromEvent(window, 'resize')
        .pipe(debounceTime(200))
        .subscribe(() => {
          this.updateDesktopStatus();
        });
    }
  }

  ngAfterViewInit(): void {
    // Mark converter as ready after view initialization
    // This prevents ExpressionChangedAfterItHasBeenCheckedError
    Promise.resolve().then(() => {
      this.converterReady.set(true);
    });
  }

  ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe();
  }

  private updateDesktopStatus(): void {
    const wasDesktop = this.isDesktop();
    const nowDesktop = window.innerWidth >= 1200;
    this.isDesktop.set(nowDesktop);

    // Restore calendar when switching back to desktop if events exist
    if (!wasDesktop && nowDesktop && this.calendarStateService.events().length > 0) {
      this.calendarStateService.isVisible.set(true);
    }
  }

  /**
   * Handle calendar visibility change
   */
  handleCalendarVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.calendarStateService.hideCalendar();
    }
  }

  /**
   * Handle events change from calendar view (drag & drop, resize)
   */
  handleCalendarEventsChange(updatedEvents: CalendarEvent[]): void {
    this.calendarStateService.updateEvents(updatedEvents);
  }

  /**
   * Handle export from calendar view
   */
  handleCalendarExport(): void {
    this.calendarStateService.requestExport();
  }

  protected blogArticlePath(article: BlogArticle): string {
    return `/blog/${article.slug}`;
  }

  protected localized(article: BlogArticle) {
    return article.locales[this.languageService.currentLang()];
  }
}
