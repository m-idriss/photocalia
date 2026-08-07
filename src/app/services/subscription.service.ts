import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ConverterService } from './converter';
import {
  BillingCycle,
  CheckoutRequest,
  CheckoutResponse,
  CheckoutPlanId,
  SubscriptionStatusResponse,
} from '../models';

/**
 * Service for managing Stripe subscription checkout and status.
 */
@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly converterService = inject(ConverterService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly baseUrl = `${environment.apiUrl}/subscriptions`;

  /**
   * Create a Stripe Checkout Session and return the session URL.
   */
  createCheckout(planId: CheckoutPlanId, billingCycle: BillingCycle): Observable<CheckoutResponse> {
    const currentUser = this.authService.currentUser();
    const body: CheckoutRequest = {
      planId,
      billingCycle,
      userId: this.converterService.getUserId(),
      email: currentUser?.email ?? undefined,
    };
    return this.http.post<CheckoutResponse>(this.baseUrl, body);
  }

  /**
   * Get current subscription status for a user.
   */
  getStatus(userId: string): Observable<SubscriptionStatusResponse> {
    return this.http.get<SubscriptionStatusResponse>(
      `${this.baseUrl}/status?userId=${encodeURIComponent(userId)}`,
    );
  }

  /**
   * Redirect the browser to the Stripe Checkout URL.
   * Only runs in the browser (SSR-safe).
   */
  redirectToCheckout(sessionUrl: string): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = sessionUrl;
    }
  }
}
