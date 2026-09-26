# Pricing and conversion credits

Approved public offer (26 September 2026):

| Offer | EUR price | Allowance |
| --- | --- | --- |
| Free | 0 | 3 conversions per calendar month |
| Pay as you go | 0.99 once | 1 additional conversion credit |
| Plus monthly | 2.99 per month | 15 conversions per calendar month in total |
| Plus annual | 29.99 per year, billed upfront | 15 conversions per calendar month in total |

Annual savings are approximately 16.4% compared with twelve monthly payments. Display “about 16%”, not 17%. The monthly equivalent is about EUR 2.50. Never imply that annual billing grants 180 immediately spendable credits.

One conversion means one source image or PDF, not one extracted event or PDF page. Batch files count separately. Quotas reset at the start of the UTC calendar month, without rollover. Purchased credits are separate, do not expire at month end, and are consumed only after the available monthly allowance. Failed processing restores the reserved credit. Free-installation protections must not prevent spending a purchased credit.

Pro and Business are legacy entitlements: preserve their existing limits, Stripe prices and subscriptions. PLUS is a distinct backend plan. No automatic migration, cancellation or repricing of existing customers. New checkout accepts Plus only. Do not advertise unlimited processing, teams or priority processing unless actually implemented.

## Implementation and activation

- Frontend: `src/app/constants/subscription.constants.ts`, bilingual translations, pricing, homepage, search, route metadata/structured data, terms and checkout confirmation.
- Backend: PLUS quota 15, atomic credit reservation/refund, idempotent payment fulfillment keyed by Stripe Checkout Session ID.
- Stripe: configure new recurring EUR prices at 299 cents/month and 2999 cents/year using `STRIPE_PRICE_PLUS_MONTHLY` and `STRIPE_PRICE_PLUS_YEARLY`. Never overwrite the legacy prices. The server validates amount, currency and recurrence before opening checkout.
- One-time checkout creates fixed server-side price data: EUR 0.99 for one credit. The client never supplies the price, credit count or entitlement owner.
- Subscribe webhooks to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `customer.subscription.created/updated/deleted`. Grant only on confirmed paid checkout. A failed database write returns an error for Stripe retry; repeated deliveries must not duplicate credits.
- Deploy the backend and configure/test Stripe before publishing the frontend offer. Verify the public plans endpoint returns FREE=3 and PLUS=15; test delayed confirmation, duplicate webhook delivery, failed conversion/refund and existing subscriber protection. No real charge is required for these checks: use Stripe test mode.
- The success page verifies the actual authenticated account's Checkout Session; a success URL alone never grants entitlement. It offers another check if payment is pending.
- A checkout draft is stored locally in IndexedDB only when the user opens purchase options from the converter. It is account-bound, consumed on return, and discarded on next access after one hour. If storage is unavailable, reselecting the file is necessary.
- Cancellation sets `cancel_at_period_end`; support remains the documented cancellation channel. Preserve statutory consumer rights; this pricing change does not introduce a blanket waiver or a no-refund policy.

## Approved short copy

FR: « 3 conversions gratuites par mois. Besoin de plus ? Une conversion à 0,99 €, sans abonnement, ou Plus : 15 conversions par mois pour 2,99 €/mois ou 29,99 €/an. »

EN: “3 free conversions per month. Need more? One conversion for €0.99 without a subscription, or Plus: 15 conversions per month for €2.99/month or €29.99/year.”

Update owned launch drafts alongside the app. Publishing external posts or sending customer announcements is a separate action; do not describe unactivated billing as already live.

## Verification of this change

- 291 frontend unit tests passed; lint, public-claims checks, blog checks and generated API contract checks passed.
- 37 targeted backend tests passed, including concurrent spending, duplicate payment delivery, refund behavior, preserved legacy limits and payment authentication.
- Three browser scenarios passed with mocked API/Stripe responses: French monthly/annual offers and responsive layout; quota exhaustion to payment confirmation and restored files; partially successful batches retaining their first results after checkout.
- Production build generated 50 prerendered routes. French pricing metadata and HTML contain the new offer.
- Backend and frontend OpenAPI snapshots match.
- No hosted Stripe test or production deployment was performed. Local Stripe credentials and the new recurring price IDs were not available. Do not treat simulated checkout tests as evidence of live payment activation.
