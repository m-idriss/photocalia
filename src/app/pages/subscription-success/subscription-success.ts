import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { ConverterService } from '../../services/converter';
import { SubscriptionService } from '../../services/subscription.service';
import { timer, switchMap, takeWhile, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-subscription-success',
  imports: [RouterLink, TranslatePipe, LocalizeRoutePipe],
  templateUrl: './subscription-success.html',
  styleUrl: './subscription-success.scss',
})
export class SubscriptionSuccess implements OnInit {
  protected readonly sessionId = signal<string | null>(null);
  protected readonly kind = signal<'credit' | 'subscription'>('subscription');
  private readonly destroyRef = inject(DestroyRef);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly converterService = inject(ConverterService);

  ngOnInit(): void {
    const sid = this.route.snapshot.queryParamMap.get('session_id');
    this.sessionId.set(sid);

    if (!sid) {
      this.error.set('subscription.success.invalid');
      this.isLoading.set(false);
      return;
    }

    this.checkPayment();
  }

  protected checkPayment(): void {
    const sid = this.sessionId();
    if (!sid) return;
    this.isLoading.set(true);
    this.error.set(null);
    timer(0, 2000)
      .pipe(
        switchMap(() =>
          this.subscriptionService
            .confirmCheckout(sid)
            .pipe(catchError(() => of({ fulfilled: false, kind: this.kind() }))),
        ),
        takeWhile((res, index) => !res.fulfilled && index < 9, true),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.kind.set(res.kind);
          if (res.fulfilled) {
            this.converterService.clearQuotaCache();
            this.isLoading.set(false);
          }
        },
        complete: () => {
          if (this.isLoading()) {
            this.error.set('subscription.success.unconfirmed');
            this.isLoading.set(false);
          }
        },
        error: () => {
          this.error.set('subscription.success.unconfirmed');
          this.isLoading.set(false);
        },
      });
  }
}
