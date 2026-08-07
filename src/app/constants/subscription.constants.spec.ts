import { SUBSCRIPTION_PLANS } from './subscription.constants';

describe('SUBSCRIPTION_PLANS', () => {
  it('defines one complete entry for every public plan', () => {
    expect(SUBSCRIPTION_PLANS.map((plan) => plan.id)).toEqual(['free', 'pro', 'business']);
    expect(new Set(SUBSCRIPTION_PLANS.map((plan) => plan.id)).size).toBe(SUBSCRIPTION_PLANS.length);

    for (const plan of SUBSCRIPTION_PLANS) {
      expect(plan.monthlyQuota).toBeGreaterThan(0);
      expect(plan.monthlyPrice).toBeGreaterThanOrEqual(0);
      expect(plan.yearlyPrice).toBeGreaterThanOrEqual(0);
      expect(plan.features.length).toBeGreaterThan(0);
    }
  });

  it('keeps paid annual pricing below twelve monthly payments', () => {
    for (const plan of SUBSCRIPTION_PLANS) {
      if (plan.monthlyPrice === null || plan.monthlyPrice === 0 || plan.yearlyPrice === null) {
        continue;
      }

      expect(plan.yearlyPrice).toBeLessThan(plan.monthlyPrice * 12);
    }
  });
});
