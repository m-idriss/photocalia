import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

import { environment } from '../../environments/environment';
import { CheckoutResponse, DonationCheckoutRequest, ProductId } from '../models';

/**
 * Service for managing Stripe donation checkout.
 */
@Injectable({
  providedIn: 'root',
})
export class DonationService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly baseUrl = `${environment.apiUrl}/donations`;

  /**
   * Create a Stripe Checkout Session for a donation product.
   */
  checkout(productId: ProductId, email?: string): Observable<CheckoutResponse> {
    const body: DonationCheckoutRequest = {
      productId,
      email: email ?? undefined,
    };
    return this.http.post<CheckoutResponse>(`${this.baseUrl}/checkout`, body);
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
