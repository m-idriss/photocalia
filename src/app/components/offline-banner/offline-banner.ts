import {
  Component,
  signal,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './offline-banner.html',
  styleUrl: './offline-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflineBanner implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly isOffline = signal(false);
  readonly dismissed = signal(false);

  private onlineHandler = () => this.isOffline.set(false);
  private offlineHandler = () => {
    this.isOffline.set(true);
    this.dismissed.set(false);
  };

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isOffline.set(!navigator.onLine);
      window.addEventListener('online', this.onlineHandler);
      window.addEventListener('offline', this.offlineHandler);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('online', this.onlineHandler);
      window.removeEventListener('offline', this.offlineHandler);
    }
  }

  dismiss(): void {
    this.dismissed.set(true);
  }

  retry(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }
}
