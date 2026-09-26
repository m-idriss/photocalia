import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Subject } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SubscriptionService } from '../../services/subscription.service';
import { SubscriptionStatusResponse } from '../../models';

import { Pricing } from './pricing';
import { SUBSCRIPTION_PLANS } from '../../constants';

describe('Pricing', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pricing],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Pricing);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render 3 plan cards', () => {
    const fixture = TestBed.createComponent(Pricing);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.plan-card');
    expect(cards.length).toBe(SUBSCRIPTION_PLANS.length + 1);
  });

  it('should default to monthly billing', () => {
    const fixture = TestBed.createComponent(Pricing);
    fixture.detectChanges();
    expect(fixture.componentInstance['billingCycle']()).toBe('monthly');
  });

  it('should toggle to yearly billing', () => {
    const fixture = TestBed.createComponent(Pricing);
    fixture.detectChanges();
    const yearlyBtn = fixture.nativeElement.querySelector('.toggle-btn:last-child');
    yearlyBtn.click();
    expect(fixture.componentInstance['billingCycle']()).toBe('yearly');
  });

  it('should show yearly total price when yearly is selected', () => {
    const fixture = TestBed.createComponent(Pricing);
    fixture.detectChanges();
    fixture.componentInstance['billingCycle'].set('yearly');
    fixture.detectChanges();
    const yearlyTotals = fixture.nativeElement.querySelectorAll('.price-yearly-total');
    // Plus has a yearly price
    expect(yearlyTotals.length).toBeGreaterThan(0);
  });

  it('should highlight the Plus plan', () => {
    const fixture = TestBed.createComponent(Pricing);
    fixture.detectChanges();
    const highlighted = fixture.nativeElement.querySelectorAll('.plan-card.highlighted');
    expect(highlighted.length).toBe(1);
  });

  it('should use the production quota fallback while plans are loading', () => {
    const fixture = TestBed.createComponent(Pricing);
    const proPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'plus')!;
    expect(fixture.componentInstance['getQuotaParams'](proPlan)).toEqual({
      limit: proPlan.monthlyQuota,
    });
  });

  it('should return "0" as price for free plan', () => {
    const fixture = TestBed.createComponent(Pricing);
    const component = fixture.componentInstance;
    const freePlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'free')!;
    expect(component['getPrice'](freePlan)).toBe('0');
  });

  it('should return monthly price for pro plan in monthly mode', () => {
    const fixture = TestBed.createComponent(Pricing);
    const component = fixture.componentInstance;
    component['billingCycle'].set('monthly');
    const proPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'plus')!;
    expect(component['getPrice'](proPlan)).toBe('2.99');
  });

  it('should return monthly equivalent when yearly is selected for pro plan', () => {
    const fixture = TestBed.createComponent(Pricing);
    const component = fixture.componentInstance;
    component['billingCycle'].set('yearly');
    const proPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'plus')!;
    // 29.99 / 12 = 2.50 (rounded to 2 decimal places)
    expect(parseFloat(component['getPrice'](proPlan))).toBeCloseTo(29.99 / 12, 1);
  });
  it('ignores a previous account status response', () => {
    const auth = TestBed.inject(AuthService);
    const status = new Subject<SubscriptionStatusResponse>();
    spyOn(TestBed.inject(SubscriptionService), 'getStatus').and.returnValue(status);
    auth.currentUser.set({ uid: 'old-user', email: null, displayName: null, photoURL: null });
    const fixture = TestBed.createComponent(Pricing);
    fixture.detectChanges();
    auth.currentUser.set({ uid: 'new-user', email: null, displayName: null, photoURL: null });
    status.next({ planId: 'plus', status: 'active' } as SubscriptionStatusResponse);
    expect(fixture.componentInstance['hasSubscription']()).toBeFalse();
    fixture.destroy();
    expect(status.observed).toBeFalse();
  });

  for (const purchase of ['credit', 'plus']) {
    it(`shows a recoverable error when sign-in fails for ${purchase}`, async () => {
      const auth = TestBed.inject(AuthService);
      spyOn(auth, 'signInWithGoogle').and.rejectWith(new Error('popup closed'));
      const subscriptions = TestBed.inject(SubscriptionService);
      const buy = spyOn(subscriptions, 'buyCredit');
      const subscribe = spyOn(subscriptions, 'createCheckout');
      const component = TestBed.createComponent(Pricing).componentInstance;
      if (purchase === 'credit') await component['buyCredit']();
      else await component['subscribe'](SUBSCRIPTION_PLANS.find((p) => p.id === 'plus')!);
      expect(component['error']()).toBe('api.error.authentication_required');
      expect(component['isLoading']()).toBeNull();
      expect(buy).not.toHaveBeenCalled();
      expect(subscribe).not.toHaveBeenCalled();
    });
  }
});
