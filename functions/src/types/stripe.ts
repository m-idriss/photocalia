/**
 * TypeScript interfaces for Stripe integration
 */

import { PlanType } from "./quota";

/**
 * Stripe price ID to plan mapping
 * Update these with your actual Stripe price IDs from your dashboard
 */
export const STRIPE_PRICE_TO_PLAN: Record<string, PlanType> = {
  // Example price IDs - replace with actual IDs from Stripe Dashboard
  "price_pro_monthly": "pro",
  "price_premium_monthly": "premium",
};

/**
 * Reverse mapping for convenience
 */
export const PLAN_TO_STRIPE_PRICE: Record<PlanType, string | null> = {
  free: null,
  pro: "price_pro_monthly",
  premium: "price_premium_monthly",
};

/**
 * Webhook event data for type safety
 */
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

/**
 * Checkout session metadata
 */
export interface CheckoutSessionMetadata {
  userId: string;
  plan?: PlanType;
}
