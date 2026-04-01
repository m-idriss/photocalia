import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, TranslatePipe],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class Stats implements OnInit {
  private readonly statsService = inject(StatsService);
  private readonly logger = inject(LoggerService);
  readonly lang = inject(LanguageService);

  // Signals for reactive state
  readonly loading = signal(true);
  readonly fileCount = signal(0);
  readonly eventCount = signal(0);
  readonly displayFileCount = signal(0);
  readonly displayEventCount = signal(0);
  readonly hasError = signal(false);
  readonly timeSavedHours = signal(0);
  readonly timeSavedWorkdays = signal(0);

  ngOnInit(): void {
    this.loadStatistics();
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
        this.calculateTimeSaved(stats.eventCount);

        // Animate time saved counters
        this.animateCounter(this.timeSavedHours(), this.timeSavedHours);
        this.animateCounter(this.timeSavedWorkdays(), this.timeSavedWorkdays);
      },
      error: (err) => {
        this.logger.error('Failed to load statistics', 'Stats', err);
        this.hasError.set(true);
        this.loading.set(false);
      },
    });
  }

  /**
   * Animate counter from 0 to target value
   */
  private animateCounter(target: number, signal: { set: (value: number) => void }): void {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        signal.set(target);
        clearInterval(interval);
      } else {
        signal.set(Math.floor(current));
      }
    }, stepDuration);
  }

  /**
   * Calculate time saved based on event count
   * Formula: eventCount × 25 seconds per event
   */
  private calculateTimeSaved(eventCount: number): void {
    const timeSavedSeconds = eventCount * 25;
    const hours = Math.round(timeSavedSeconds / 3600);
    const workdays = Math.round(hours / 8);

    this.timeSavedHours.set(hours);
    this.timeSavedWorkdays.set(workdays);
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
