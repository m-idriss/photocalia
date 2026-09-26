import { Component, signal, computed, inject, PLATFORM_ID, effect } from '@angular/core';
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
import { LanguageService } from '../../services/language.service';
import { RecommendedGuides } from '../../components/recommended-guides/recommended-guides';

@Component({
  selector: 'app-pricing',
  imports: [CommonModule, RouterLink, TranslatePipe, LocalizeRoutePipe, RecommendedGuides],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class Pricing {
  protected readonly plans = SUBSCRIPTION_PLANS;
  protected readonly hasSubscription = signal(false);

  protected readonly billingCycle = signal<BillingCycle>('monthly');
  protected readonly isLoading = signal<string | null>(null); // stores the planId being loaded
  protected readonly error = signal<string | null>(null);

  private readonly subscriptionService = inject(SubscriptionService);
  private readonly authService = inject(AuthService);
  private readonly planService = inject(PlanService);
  private readonly languageService = inject(LanguageService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  constructor() {
    effect(() => {
      const uid = this.authService.currentUser()?.uid;
      this.hasSubscription.set(false);
      if (uid)
        this.subscriptionService.getStatus(uid).subscribe({
          next: (status) => this.hasSubscription.set(status.planId !== 'free'),
          error: () => {
            /* The API still enforces duplicate-subscription protection. */
          },
        });
    });
  }

  protected async buyCredit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.isAuthenticated()) {
      await this.authService.signInWithGoogle();
      if (!this.isAuthenticated()) return;
    }
    this.error.set(null);
    this.isLoading.set('credit');
    this.subscriptionService.buyCredit().subscribe({
      next: (response) => this.subscriptionService.redirectToCheckout(response.sessionUrl),
      error: (err) => {
        this.isLoading.set(null);
        this.error.set(toApiClientError(err).messageKey);
      },
    });
  }

  /** The displayed price string for a plan given the current billing cycle. */
  protected getPrice(plan: SubscriptionPlan): string {
    if (plan.monthlyPrice === null) return '0';
    const price = this.billingCycle() === 'yearly' ? plan.yearlyPrice! / 12 : plan.monthlyPrice;
    return price.toFixed(2);
  }

  protected getFormattedPrice(plan: SubscriptionPlan): string {
    return new Intl.NumberFormat(this.languageService.currentLang(), {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(this.getPrice(plan)));
  }

  /** The total yearly price for display in the yearly billing option. */
  protected getYearlyTotal(plan: SubscriptionPlan): string {
    if (plan.yearlyPrice === null) return '';
    return new Intl.NumberFormat(this.languageService.currentLang(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(plan.yearlyPrice);
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

  protected async subscribe(plan: SubscriptionPlan): Promise<void> {
    if (plan.id !== 'plus' || this.hasSubscription()) return;
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.isAuthenticated()) {
      await this.authService.signInWithGoogle();
      if (!this.isAuthenticated()) return;
    }
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
