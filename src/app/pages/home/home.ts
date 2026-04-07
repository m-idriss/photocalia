import {
  Component,
  inject,
  signal,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbToastModule, NgbProgressbarModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { Converter } from '../../components/converter/converter';
import { CalendarView } from '../../components/calendar-view';
import { Stats } from '../../components/stats/stats';
import { ToastService } from '../../services/toast.service';
import { CalendarStateService } from '../../services/calendar-state.service';
import { AuthService } from '../../services/auth.service';
import { CalendarEvent } from '../../models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ScrollRevealDirective } from '../../shared/directives';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Converter,
    CalendarView,
    Stats,
    NgbToastModule,
    NgbProgressbarModule,
    NgbTooltipModule,
    TranslatePipe,
    ScrollRevealDirective,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  public readonly toastService = inject(ToastService);
  public readonly calendarStateService = inject(CalendarStateService);
  protected readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild(Converter) converterComponent?: Converter;
  protected readonly converterReady = signal(false);

  protected readonly isDesktop = signal(false);
  private resizeSubscription?: Subscription;

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
}
