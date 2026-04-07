import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  ChangeDetectionStrategy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StatsService, Statistics } from '../../services/stats.service';
import { LanguageService } from '../../services/language.service';
import { LoggerService } from '../../services/logger.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/**
 * Stats component displaying platform statistics (file and event counts).
 * Shows engaging metrics with animated counters and glassmorphism design.
 * Includes loading state and responsive layout.
 */
@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class Stats implements OnInit, OnDestroy {
  private readonly statsService = inject(StatsService);
  private readonly logger = inject(LoggerService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly lang = inject(LanguageService);

  // Signals for reactive state
  readonly loading = signal(true);
  readonly fileCount = signal(0);
  readonly eventCount = signal(0);
  readonly displayFileCount = signal(0);
  readonly displayEventCount = signal(0);
  readonly hasError = signal(false);
  // Raw values kept stable as source of truth.
  readonly timeSavedHours = signal(0);
  readonly timeSavedWorkdays = signal(0);
  // Dedicated animated values used in the template.
  readonly displayTimeSavedHours = signal(0);
  readonly displayTimeSavedWorkdays = signal(0);

  private readonly animationFrames = new Set<number>();

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    for (const frameId of this.animationFrames) {
      cancelAnimationFrame(frameId);
    }
    this.animationFrames.clear();
  }

  /**
   * Load statistics from the backend API
   */
  private loadStatistics(): void {
    this.statsService.getStatistics().subscribe({
      next: (stats: Statistics) => {
        this.fileCount.set(stats.fileCount);
        this.eventCount.set(stats.eventCount);
        this.loading.set(false);

        // Animate the counters
        this.animateCounter(stats.fileCount, this.displayFileCount);
        this.animateCounter(stats.eventCount, this.displayEventCount);

        // Calculate time saved metrics
        const { hours, workdays } = this.calculateTimeSaved(stats.eventCount);
        this.timeSavedHours.set(hours);
        this.timeSavedWorkdays.set(workdays);

        // Animate time saved counters
        this.animateCounter(hours, this.displayTimeSavedHours);
        this.animateCounter(workdays, this.displayTimeSavedWorkdays);
      },
      error: (err) => {
        this.logger.error('Failed to load statistics', 'Stats', err);
        this.hasError.set(true);
        this.loading.set(false);
      },
    });
  }

  /**
   * Animate counter from 0 to target value using requestAnimationFrame
   * to avoid blocking the main thread during page load.
   */
  private animateCounter(target: number, signal: { set: (value: number) => void }): void {
    if (target === 0 || !isPlatformBrowser(this.platformId)) {
      signal.set(target);
      return;
    }
    const duration = 1200;
    const start = performance.now();

    const step = (now: number): void => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      signal.set(Math.floor(eased * target));
      if (progress < 1) {
        this.scheduleAnimationFrame(step);
      }
    };

    this.scheduleAnimationFrame(step);
  }

  /**
   * Calculate time saved based on event count
   * Formula: eventCount × 25 seconds per event
   */
  private calculateTimeSaved(eventCount: number): { hours: number; workdays: number } {
    const timeSavedSeconds = eventCount * 25;
    const hours = Math.round(timeSavedSeconds / 3600);
    const workdays = Math.round(hours / 8);

    return { hours, workdays };
  }

  private scheduleAnimationFrame(step: FrameRequestCallback): void {
    const frameId = requestAnimationFrame((timestamp) => {
      this.animationFrames.delete(frameId);
      step(timestamp);
    });
    this.animationFrames.add(frameId);
  }

  /**
   * Format number with thousand separators
   */
  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  t(key: string, params?: Record<string, string | number>): string {
    let text = this.lang.translate(key);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }
}
