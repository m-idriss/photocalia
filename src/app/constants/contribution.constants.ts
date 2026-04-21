import { DonationProduct } from '../models';

/**
 * Default contribution URLs (Stripe payment links)
 */
export const DEFAULT_CONTRIBUTION_URLS = {
  coffeeUrl: 'https://buy.stripe.com/4gM4gA09TalwgRAd7m4Vy01',
  snackUrl: 'https://buy.stripe.com/3cI3cw3m565g9p82sI4Vy00',
  mealUrl: 'https://buy.stripe.com/28E28s1dX79keJs1oE4Vy02',
} as const;

/**
 * Donation product definitions.
 * i18n keys reference public/assets/i18n/en.json.
 */
export const DONATION_PRODUCTS: DonationProduct[] = [
  {
    id: 'coffee',
    labelKey: 'donation.product.coffee.name',
    emoji: '☕',
    ctaKey: 'donation.product.coffee.cta',
  },
  {
    id: 'snack',
    labelKey: 'donation.product.snack.name',
    emoji: '🍪',
    ctaKey: 'donation.product.snack.cta',
  },
  {
    id: 'meal',
    labelKey: 'donation.product.meal.name',
    emoji: '🍽️',
    ctaKey: 'donation.product.meal.cta',
  },
];
