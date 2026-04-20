export type PlanId = 'free' | 'pro' | 'business';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'free';

export interface SubscriptionPlan {
  id: PlanId;
  labelKey: string;
  descriptionKey: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  quotaKey: string;
  features: string[];
  highlighted: boolean;
  ctaKey: string;
}

export interface CheckoutRequest {
  planId: PlanId;
  billingCycle: BillingCycle;
  userId: string;
  email: string | null;
}

export interface CheckoutResponse {
  sessionUrl: string;
}

export interface SubscriptionStatusResponse {
  planId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
}
