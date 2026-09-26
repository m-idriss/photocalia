import { SubscriptionPlan } from '../models/subscription.model';

/**
 * Subscription plan definitions.
 * Prices are in EUR. i18n keys reference public/assets/i18n/en.json.
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    labelKey: 'pricing.plan.free.name',
    descriptionKey: 'pricing.plan.free.description',
    monthlyPrice: null,
    yearlyPrice: null,
    monthlyQuota: 3,
    quotaKey: 'pricing.plan.free.quota',
    features: [
      'pricing.feature.ai_conversion',
      'pricing.feature.ics_export',
      'pricing.feature.google_calendar',
      'pricing.feature.batch_upload',
    ],
    highlighted: false,
    ctaKey: 'pricing.plan.free.cta',
  },
  {
    id: 'plus',
    labelKey: 'pricing.plan.plus.name',
    descriptionKey: 'pricing.plan.plus.description',
    monthlyPrice: 2.99,
    yearlyPrice: 29.99,
    monthlyQuota: 15,
    quotaKey: 'pricing.plan.plus.quota',
    features: [
      'pricing.feature.ai_conversion',
      'pricing.feature.ics_export',
      'pricing.feature.google_calendar',
      'pricing.feature.batch_upload',
      'pricing.feature.email_support',
    ],
    highlighted: true,
    ctaKey: 'pricing.plan.plus.cta',
  },
];

export const CONVERSION_CREDIT_PRICE = 0.99;
