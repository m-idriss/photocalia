# Stripe Integration - Frontend Usage Examples

This document shows how to integrate Stripe billing in your Angular frontend.

## Table of Contents

1. [Service Setup](#service-setup)
2. [Create Checkout Session](#create-checkout-session)
3. [Handle Success/Cancel](#handle-successcancel)
4. [Display Current Plan](#display-current-plan)
5. [Customer Portal](#customer-portal)

---

## Service Setup

### 1. Create Billing Service

Create `src/app/services/billing.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

export type PlanType = 'free' | 'pro' | 'premium';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private readonly apiUrl = 'https://us-central1-YOUR-PROJECT.cloudfunctions.net';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  /**
   * Create a Stripe checkout session and redirect to checkout
   */
  async createCheckoutSession(
    plan: 'pro' | 'premium',
    successUrl?: string,
    cancelUrl?: string
  ): Promise<void> {
    try {
      // Get current user's ID token
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to subscribe');
      }

      const token = await user.getIdToken();

      // Default URLs
      const defaultSuccessUrl = `${window.location.origin}/subscription/success`;
      const defaultCancelUrl = `${window.location.origin}/pricing`;

      // Create checkout session
      const response = await firstValueFrom(
        this.http.post<{ url: string }>(
          `${this.apiUrl}/createCheckoutSession`,
          {
            plan,
            successUrl: successUrl || defaultSuccessUrl,
            cancelUrl: cancelUrl || defaultCancelUrl
          },
          {
            headers: new HttpHeaders({
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            })
          }
        )
      );

      // Redirect to Stripe Checkout
      window.location.href = response.url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }
  }

  /**
   * Get current subscription status from Firestore
   */
  async getSubscriptionStatus(): Promise<{
    plan: PlanType;
    quotaUsed: number;
    quotaLimit: number;
    isActive: boolean;
  } | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return null;
      }

      const token = await user.getIdToken();

      const response = await firstValueFrom(
        this.http.post<any>(
          `${this.apiUrl}/quotaStatusFunction`,
          { userId: user.uid },
          {
            headers: new HttpHeaders({
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            })
          }
        )
      );

      if (response.success && response.quota) {
        return {
          plan: response.quota.plan,
          quotaUsed: response.quota.usageCount,
          quotaLimit: response.quota.limit,
          isActive: response.quota.plan !== 'free'
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return null;
    }
  }
}
```

---

## Create Checkout Session

### Example: Pricing Page Component

Create `src/app/components/pricing/pricing.component.ts`:

```typescript
import { Component } from '@angular/core';
import { BillingService } from '../../services/billing.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent {
  isLoading = false;
  error: string | null = null;

  constructor(
    private billingService: BillingService,
    private authService: AuthService
  ) {}

  async subscribeToPlan(plan: 'pro' | 'premium') {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.error = 'Please sign in to subscribe';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      await this.billingService.createCheckoutSession(plan);
      // User will be redirected to Stripe Checkout
    } catch (error: any) {
      this.error = error.message || 'Failed to start checkout. Please try again.';
      this.isLoading = false;
    }
  }
}
```

Template `pricing.component.html`:

```html
<div class="pricing-section">
  <h2>Choose Your Plan</h2>

  <div class="error-message" *ngIf="error">
    {{ error }}
  </div>

  <div class="pricing-cards">
    <!-- Free Plan -->
    <div class="pricing-card">
      <h3>Free</h3>
      <p class="price">$0<span>/month</span></p>
      <ul class="features">
        <li>3 conversions per month</li>
        <li>Basic support</li>
      </ul>
      <button disabled>Current Plan</button>
    </div>

    <!-- Pro Plan -->
    <div class="pricing-card featured">
      <h3>Pro</h3>
      <p class="price">$9.99<span>/month</span></p>
      <ul class="features">
        <li>100 conversions per month</li>
        <li>Priority support</li>
        <li>Advanced features</li>
      </ul>
      <button 
        (click)="subscribeToPlan('pro')"
        [disabled]="isLoading">
        {{ isLoading ? 'Loading...' : 'Subscribe to Pro' }}
      </button>
    </div>

    <!-- Premium Plan -->
    <div class="pricing-card">
      <h3>Premium</h3>
      <p class="price">$29.99<span>/month</span></p>
      <ul class="features">
        <li>1000 conversions per month</li>
        <li>24/7 premium support</li>
        <li>All features included</li>
        <li>Custom integrations</li>
      </ul>
      <button 
        (click)="subscribeToPlan('premium')"
        [disabled]="isLoading">
        {{ isLoading ? 'Loading...' : 'Subscribe to Premium' }}
      </button>
    </div>
  </div>
</div>
```

---

## Handle Success/Cancel

### Success Page Component

Create `src/app/components/subscription-success/subscription-success.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BillingService } from '../../services/billing.service';

@Component({
  selector: 'app-subscription-success',
  template: `
    <div class="success-container">
      <div class="success-icon">✓</div>
      <h1>Subscription Successful!</h1>
      <p>Thank you for subscribing to {{ plan }} plan.</p>
      <p class="quota-info">
        You now have {{ quotaLimit }} conversions per month.
      </p>
      <button (click)="goToApp()">Start Converting</button>
    </div>
  `,
  styleUrls: ['./subscription-success.component.scss']
})
export class SubscriptionSuccessComponent implements OnInit {
  plan = '';
  quotaLimit = 0;

  constructor(
    private billingService: BillingService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Fetch updated subscription status
    const status = await this.billingService.getSubscriptionStatus();
    if (status) {
      this.plan = status.plan;
      this.quotaLimit = status.quotaLimit;
    }
  }

  goToApp() {
    this.router.navigate(['/']);
  }
}
```

---

## Display Current Plan

### Account Settings Component

Create `src/app/components/account/account.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { BillingService, PlanType } from '../../services/billing.service';

interface SubscriptionStatus {
  plan: PlanType;
  quotaUsed: number;
  quotaLimit: number;
  isActive: boolean;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  subscription: SubscriptionStatus | null = null;
  isLoading = true;

  constructor(private billingService: BillingService) {}

  async ngOnInit() {
    await this.loadSubscription();
  }

  async loadSubscription() {
    this.isLoading = true;
    try {
      this.subscription = await this.billingService.getSubscriptionStatus();
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      this.isLoading = false;
    }
  }

  get usagePercentage(): number {
    if (!this.subscription) return 0;
    return (this.subscription.quotaUsed / this.subscription.quotaLimit) * 100;
  }

  getPlanDisplayName(plan: PlanType): string {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  }
}
```

Template `account.component.html`:

```html
<div class="account-section">
  <h2>Your Subscription</h2>

  <div *ngIf="isLoading">
    <p>Loading subscription details...</p>
  </div>

  <div *ngIf="!isLoading && subscription" class="subscription-details">
    <div class="plan-info">
      <h3>Current Plan: {{ getPlanDisplayName(subscription.plan) }}</h3>
      <p *ngIf="!subscription.isActive" class="free-plan-note">
        Upgrade to Pro or Premium for more conversions!
      </p>
    </div>

    <div class="quota-info">
      <h4>Monthly Usage</h4>
      <div class="quota-bar">
        <div 
          class="quota-fill" 
          [style.width.%]="usagePercentage">
        </div>
      </div>
      <p>{{ subscription.quotaUsed }} / {{ subscription.quotaLimit }} conversions used</p>
    </div>

    <div class="actions">
      <button 
        *ngIf="!subscription.isActive"
        routerLink="/pricing"
        class="btn-primary">
        Upgrade Plan
      </button>
      
      <button 
        *ngIf="subscription.isActive"
        (click)="manageSubscription()"
        class="btn-secondary">
        Manage Subscription
      </button>
    </div>
  </div>
</div>
```

---

## Customer Portal

To allow users to manage their subscription (cancel, update payment method, etc.), you'll need to create a Stripe Customer Portal session.

### Add to Billing Service

```typescript
// In billing.service.ts

/**
 * Create Stripe Customer Portal session
 * This allows users to manage their subscription
 */
async createCustomerPortalSession(): Promise<void> {
  try {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const token = await user.getIdToken();

    // You'll need to create this function in Firebase Functions
    const response = await firstValueFrom(
      this.http.post<{ url: string }>(
        `${this.apiUrl}/createCustomerPortalSession`,
        {
          returnUrl: `${window.location.origin}/account`
        },
        {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          })
        }
      )
    );

    // Redirect to Stripe Customer Portal
    window.location.href = response.url;
  } catch (error: any) {
    console.error('Error creating customer portal session:', error);
    throw new Error(error.message || 'Failed to access customer portal');
  }
}
```

### Add to Account Component

```typescript
// In account.component.ts

async manageSubscription() {
  try {
    await this.billingService.createCustomerPortalSession();
    // User will be redirected to Stripe Customer Portal
  } catch (error: any) {
    alert(error.message || 'Failed to open subscription management');
  }
}
```

---

## Notes

### Important Security Considerations

1. **Never expose Stripe secret keys** in frontend code
2. **Always use Firebase ID tokens** for authentication
3. **Validate on backend** - never trust frontend data
4. **Monitor webhook failures** in Stripe Dashboard

### User Flow

1. User clicks "Subscribe" → `createCheckoutSession()` called
2. User redirected to Stripe Checkout
3. User completes payment
4. Stripe webhook fires → Backend updates Firestore
5. User redirected to success page
6. Frontend reads updated data from Firestore (via `getSubscriptionStatus()`)

### Testing

Use Stripe test cards in development:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Real-time Updates

For real-time subscription updates, use Firestore snapshots:

```typescript
import { doc, onSnapshot } from '@angular/fire/firestore';

// Listen to user document changes
const userDocRef = doc(this.firestore, `users/${user.uid}`);
onSnapshot(userDocRef, (snapshot) => {
  const data = snapshot.data();
  console.log('Subscription updated:', data?.plan);
  // Update UI accordingly
});
```

---

## Additional Resources

- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal Docs](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Firebase Auth with Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)

---

For complete backend documentation, see `STRIPE_INTEGRATION.md`.
