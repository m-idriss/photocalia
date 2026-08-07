import type { components } from '../generated/3dime-api';

type ApiSchemas = components['schemas'];

export type CheckoutRequest = ApiSchemas['CheckoutRequest'];
export type CheckoutResponse = ApiSchemas['CheckoutResponse'];
export type SubscriptionStatusResponse = ApiSchemas['SubscriptionStatusResponse'];
export type DonationCheckoutRequest = ApiSchemas['DonationRequest'];

export type CheckoutPlanId = CheckoutRequest['planId'];
export type PlanId =
  | CheckoutPlanId
  | Extract<ApiSchemas['SubscriptionStatusResponse']['planId'], 'free'>;
export type BillingCycle = CheckoutRequest['billingCycle'];
export type SubscriptionStatus = SubscriptionStatusResponse['status'];
export type ProductId = DonationCheckoutRequest['productId'];

export interface SubscriptionPlan {
  id: PlanId;
  labelKey: string;
  descriptionKey: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  monthlyQuota: number;
  quotaKey: string;
  features: string[];
  highlighted: boolean;
  ctaKey: string;
}

export interface DonationProduct {
  id: ProductId;
  labelKey: string;
  emoji: string;
  ctaKey: string;
}
