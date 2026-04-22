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
    id: 'pro',
    labelKey: 'pricing.plan.pro.name',
    descriptionKey: 'pricing.plan.pro.description',
    monthlyPrice: 4.99,
    yearlyPrice: 49.99,
    quotaKey: 'pricing.plan.pro.quota',
    features: [
      'pricing.feature.ai_conversion',
      'pricing.feature.ics_export',
      'pricing.feature.google_calendar',
      'pricing.feature.batch_upload',
      'pricing.feature.priority_ai',
      'pricing.feature.email_support',
    ],
    highlighted: true,
    ctaKey: 'pricing.plan.pro.cta',
  },
  {
    id: 'business',
    labelKey: 'pricing.plan.business.name',
    descriptionKey: 'pricing.plan.business.description',
    monthlyPrice: 14.99,
    yearlyPrice: 149.99,
    quotaKey: 'pricing.plan.business.quota',
    features: [
      'pricing.feature.ai_conversion',
      'pricing.feature.ics_export',
      'pricing.feature.google_calendar',
      'pricing.feature.batch_upload',
      'pricing.feature.priority_ai',
      'pricing.feature.email_support',
      'pricing.feature.priority_support',
    ],
    highlighted: false,
    ctaKey: 'pricing.plan.business.cta',
  },
];
