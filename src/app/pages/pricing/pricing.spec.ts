import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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
    expect(cards.length).toBe(SUBSCRIPTION_PLANS.length);
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
    // Pro and Business have yearly prices
    expect(yearlyTotals.length).toBeGreaterThan(0);
  });

  it('should highlight the Pro plan', () => {
    const fixture = TestBed.createComponent(Pricing);
    fixture.detectChanges();
    const highlighted = fixture.nativeElement.querySelectorAll('.plan-card.highlighted');
    expect(highlighted.length).toBe(1);
  });

  it('should use the production quota fallback while plans are loading', () => {
    const fixture = TestBed.createComponent(Pricing);
    const proPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'pro')!;
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
    const proPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'pro')!;
    expect(component['getPrice'](proPlan)).toBe('4.99');
  });

  it('should return monthly equivalent when yearly is selected for pro plan', () => {
    const fixture = TestBed.createComponent(Pricing);
    const component = fixture.componentInstance;
    component['billingCycle'].set('yearly');
    const proPlan = SUBSCRIPTION_PLANS.find((p) => p.id === 'pro')!;
    // 49.99 / 12 = 4.17 (rounded to 2 decimal places)
    expect(parseFloat(component['getPrice'](proPlan))).toBeCloseTo(49.99 / 12, 1);
  });
});
