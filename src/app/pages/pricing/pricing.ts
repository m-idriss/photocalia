import { Component, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';
import { PlanService } from '../../services/plan.service';
import { SUBSCRIPTION_PLANS } from '../../constants';
import { BillingCycle, SubscriptionPlan } from '../../models';
import { toApiClientError } from '../../utils';
import { RecommendedGuides } from '../../components/recommended-guides/recommended-guides';

@Component({
  selector: 'app-pricing',
  imports: [CommonModule, RouterLink, TranslatePipe, LocalizeRoutePipe, RecommendedGuides],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class Pricing {
  protected readonly plans = SUBSCRIPTION_PLANS;

  protected readonly billingCycle = signal<BillingCycle>('monthly');
  protected readonly isLoading = signal<string | null>(null); // stores the planId being loaded
  protected readonly error = signal<string | null>(null);

  private readonly subscriptionService = inject(SubscriptionService);
  private readonly authService = inject(AuthService);
  private readonly planService = inject(PlanService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  /** The displayed price string for a plan given the current billing cycle. */
  protected getPrice(plan: SubscriptionPlan): string {
    if (plan.monthlyPrice === null) return '0';
    const price = this.billingCycle() === 'yearly' ? plan.yearlyPrice! / 12 : plan.monthlyPrice;
    return price.toFixed(2);
  }

  /** The total yearly price for display in the yearly billing option. */
  protected getYearlyTotal(plan: SubscriptionPlan): string {
    if (plan.yearlyPrice === null) return '';
    return plan.yearlyPrice.toFixed(2);
  }

  /**
   * Use the public API as the source of truth for monthly quotas while keeping
   * stable fallbacks for prerendering and temporary API outages.
   */
  protected getQuotaParams(plan: SubscriptionPlan): { limit: number } {
    const apiPlan = this.planService
      .plans()
      .find((candidate) => candidate.plan === plan.id.toUpperCase());
    return { limit: apiPlan?.limit ?? plan.monthlyQuota };
  }

  protected toggleBilling(cycle: BillingCycle): void {
    this.billingCycle.set(cycle);
  }

  protected subscribe(plan: SubscriptionPlan): void {
    if (plan.id === 'free') return;
    if (!isPlatformBrowser(this.platformId)) return;

    this.error.set(null);
    this.isLoading.set(plan.id);

    this.subscriptionService.createCheckout(plan.id, this.billingCycle()).subscribe({
      next: (response) => {
        this.isLoading.set(null);
        this.subscriptionService.redirectToCheckout(response.sessionUrl);
      },
      error: (err) => {
        this.isLoading.set(null);
        this.error.set(toApiClientError(err).messageKey);
      },
    });
  }
}
