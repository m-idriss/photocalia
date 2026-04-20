import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { ConverterService } from '../../services/converter';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionStatusResponse } from '../../models';

@Component({
  selector: 'app-subscription-success',
  imports: [RouterLink, TranslatePipe, LocalizeRoutePipe],
  templateUrl: './subscription-success.html',
  styleUrl: './subscription-success.scss',
})
export class SubscriptionSuccess implements OnInit {
  protected readonly sessionId = signal<string | null>(null);
  protected readonly status = signal<SubscriptionStatusResponse | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly converterService = inject(ConverterService);

  ngOnInit(): void {
    const sid = this.route.snapshot.queryParamMap.get('session_id');
    this.sessionId.set(sid);

    const userId = this.converterService.getUserId();
    this.subscriptionService.getStatus(userId).subscribe({
      next: (res) => {
        this.status.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        // Not a blocking error — the payment still succeeded
      },
    });
  }
}
