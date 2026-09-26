import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SubscriptionService } from './subscription.service';
import { AuthService } from './auth.service';
import { ConverterService } from './converter';

describe('SubscriptionService payment boundary', () => {
  let service: SubscriptionService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { currentUser: () => ({ uid: 'uid', email: 'user@example.test' }) },
        },
        { provide: ConverterService, useValue: { getUserId: () => 'uid' } },
      ],
    });
    service = TestBed.inject(SubscriptionService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('never sends a client-controlled price or credit quantity', () => {
    service.buyCredit().subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/subscriptions/credits'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ sessionUrl: 'https://checkout.stripe.com/test' });
  });

  it('keeps unpaid checkout pending instead of treating the return URL as success', () => {
    let fulfilled = true;
    service.confirmCheckout('cs_pending').subscribe((response) => (fulfilled = response.fulfilled));
    const req = http.expectOne((r) => r.url.endsWith('/subscriptions/checkout-status'));
    expect(req.request.params.get('sessionId')).toBe('cs_pending');
    req.flush({ fulfilled: false, kind: 'credit' });
    expect(fulfilled).toBeFalse();
  });

  it('sends Plus and the selected annual billing cycle', () => {
    service.createCheckout('plus', 'yearly').subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/subscriptions'));
    expect(req.request.body.planId).toBe('plus');
    expect(req.request.body.billingCycle).toBe('yearly');
    req.flush({ sessionUrl: 'https://checkout.stripe.com/test' });
  });
});
