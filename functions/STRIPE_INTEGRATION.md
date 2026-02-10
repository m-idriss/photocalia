# Stripe Integration Documentation

This document provides comprehensive documentation for the Stripe subscription integration in Photocalia.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup](#setup)
4. [API Endpoints](#api-endpoints)
5. [Webhook Events](#webhook-events)
6. [Data Model](#data-model)
7. [Security](#security)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Stripe integration enables Photocalia to offer paid subscription plans (Pro and Premium) with automatic billing and quota management. The system is built with the following principles:

- **Firestore as Single Source of Truth**: All user data, quotas, and subscription status live in Firestore
- **No Direct Frontend-Stripe Communication**: All Stripe operations go through Firebase Functions
- **Idempotent Operations**: Webhook handlers prevent duplicate processing
- **Type Safety**: Fully typed TypeScript implementation
- **Production Ready**: Error handling, logging, and retry logic built-in

### Features

- ✅ Create checkout sessions for subscription purchase
- ✅ Automatic quota updates on subscription activation
- ✅ Webhook handling for subscription lifecycle events
- ✅ Idempotent event processing
- ✅ Customer management (create/retrieve)
- ✅ Plan-based quota enforcement
- ✅ Automatic downgrade to free on cancellation

---

## Architecture

### Components

```
┌─────────────────┐
│   Frontend      │
│   (Angular)     │
└────────┬────────┘
         │ 1. Auth Token
         ▼
┌─────────────────────────────────┐
│  Firebase Functions             │
│  ┌───────────────────────────┐  │
│  │ createCheckoutSession     │  │
│  └───────────┬───────────────┘  │
│              │ 2. Create Session│
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │   Billing Service         │  │
│  │ - Customer Management     │  │
│  │ - Checkout Sessions       │  │
│  │ - Firestore Updates       │  │
│  └───────────┬───────────────┘  │
│              │                   │
└──────────────┼───────────────────┘
               │
               ▼
      ┌─────────────────┐
      │     Stripe      │
      │  - Checkout     │
      │  - Webhooks     │
      └────────┬────────┘
               │ 3. Webhook Events
               ▼
┌─────────────────────────────────┐
│  Firebase Functions             │
│  ┌───────────────────────────┐  │
│  │   stripeWebhook           │  │
│  └───────────┬───────────────┘  │
│              │                   │
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │ Webhook Handler Service   │  │
│  │ - Signature Verification  │  │
│  │ - Idempotency Check       │  │
│  │ - Event Processing        │  │
│  └───────────┬───────────────┘  │
│              │                   │
└──────────────┼───────────────────┘
               │ 4. Update User Data
               ▼
      ┌─────────────────┐
      │   Firestore     │
      │   users/{uid}   │
      └─────────────────┘
```

### Service Layer

1. **BillingService** (`services/billing.ts`)
   - Customer creation and management
   - Checkout session creation
   - Subscription activation/downgrade
   - Firestore integration

2. **WebhookHandlerService** (`services/webhook-handler.ts`)
   - Event verification and processing
   - Idempotency management
   - Event routing and handling
   - Error recovery

3. **Stripe Config** (`utils/stripe-config.ts`)
   - Stripe SDK initialization
   - API key management
   - Webhook secret handling

---

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install stripe
```

### 2. Configure Stripe

#### A. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers > API Keys**
3. Copy your **Secret Key** (starts with `sk_`)
4. Keep it secure - never commit to source control

#### B. Set Up Products and Prices

1. Go to **Products** in Stripe Dashboard
2. Create two products:
   - **Pro Plan** (Monthly subscription)
   - **Premium Plan** (Monthly subscription)
3. Note the **Price IDs** (start with `price_`)

#### C. Update Price Mapping

Edit `functions/src/types/stripe.ts`:

```typescript
export const STRIPE_PRICE_TO_PLAN: Record<string, PlanType> = {
  "price_XXXXXXXXXXXXX": "pro",      // Replace with your Pro price ID
  "price_YYYYYYYYYYYYY": "premium",  // Replace with your Premium price ID
};

export const PLAN_TO_STRIPE_PRICE: Record<PlanType, string | null> = {
  free: null,
  pro: "price_XXXXXXXXXXXXX",        // Replace with your Pro price ID
  premium: "price_YYYYYYYYYYYYY",    // Replace with your Premium price ID
};
```

### 3. Configure Webhook

#### A. Create Webhook Endpoint

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL:
   - Production: `https://us-central1-YOUR-PROJECT.cloudfunctions.net/stripeWebhook`
   - Test: Use Stripe CLI or test mode URL
4. Select events to listen to:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing Secret** (starts with `whsec_`)

### 4. Set Environment Variables

#### Using Firebase CLI:

```bash
# Set Stripe secret key
firebase functions:secrets:set STRIPE_SECRET_KEY

# Set webhook secret
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

#### For Local Testing:

Create `functions/.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Important**: Never commit `.env.local` to version control!

### 5. Deploy Functions

```bash
# Build functions
cd functions
npm run build

# Deploy to Firebase
firebase deploy --only functions:createCheckoutSession,functions:stripeWebhook
```

---

## API Endpoints

### POST /createCheckoutSession

Creates a Stripe checkout session for subscription purchase.

#### Authentication
Requires Firebase ID token in Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

#### Request Body

```typescript
{
  "plan": "pro" | "premium",           // Required
  "successUrl": string,                 // Optional, default: https://photocalia.com/success
  "cancelUrl": string                   // Optional, default: https://photocalia.com/pricing
}
```

#### Response

**Success (200)**:
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Error (400)**:
```json
{
  "error": "Invalid plan. Must be 'pro' or 'premium'"
}
```

**Error (401)**:
```json
{
  "error": "Authentication failed",
  "message": "Invalid or expired token"
}
```

#### Example Usage

```typescript
// Frontend (Angular)
async createCheckout(plan: 'pro' | 'premium') {
  const user = await this.auth.currentUser;
  const token = await user.getIdToken();

  const response = await fetch(
    'https://us-central1-YOUR-PROJECT.cloudfunctions.net/createCheckoutSession',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        plan: plan,
        successUrl: 'https://photocalia.com/success',
        cancelUrl: 'https://photocalia.com/pricing'
      })
    }
  );

  const data = await response.json();
  
  // Redirect to Stripe Checkout
  window.location.href = data.url;
}
```

---

### POST /stripeWebhook

Receives webhook events from Stripe. **This endpoint is called by Stripe, not your frontend.**

#### Authentication
Uses Stripe webhook signature verification (no Firebase auth needed).

#### Request Headers
```
stripe-signature: t=...,v1=...
```

#### Request Body
Raw Stripe event JSON (signature verified).

#### Response

**Success (200)**:
```json
{
  "received": true,
  "eventId": "evt_..."
}
```

**Error (400)**:
```json
{
  "error": "Webhook signature verification failed"
}
```

---

## Webhook Events

The system handles the following Stripe webhook events:

### 1. checkout.session.completed

**Trigger**: User completes checkout and payment is successful

**Action**:
- Extract user ID from session metadata or customer lookup
- Get subscription ID and plan
- Activate subscription in Firestore:
  - Set `plan` to purchased plan
  - Set `quotaLimit` based on plan
  - Reset `quotaUsed` to 0
  - Update `periodStart` to now
  - Store `subscriptionId`
  - Update `updatedAt`

**Idempotency**: Event ID stored in `stripe_events` collection

### 2. invoice.paid

**Trigger**: Recurring invoice is paid (renewal)

**Action**:
- Find user by customer ID
- Get subscription and plan from invoice
- Renew subscription (same as activation):
  - Reset `quotaUsed` to 0
  - Update `periodStart` to now
  - Keep existing plan and subscription ID

**Idempotency**: Event ID stored in `stripe_events` collection

### 3. customer.subscription.updated

**Trigger**: Subscription status changes

**Action**:
- Find user by customer ID
- Check subscription status:
  - If `active`: Activate/update subscription
  - If `canceled` or `unpaid`: Downgrade to free

**Idempotency**: Event ID stored in `stripe_events` collection

### 4. customer.subscription.deleted

**Trigger**: Subscription is permanently deleted

**Action**:
- Find user by customer ID
- Downgrade to free plan:
  - Set `plan` to "free"
  - Set `quotaLimit` to 3
  - Reset `quotaUsed` to 0
  - Set `subscriptionId` to null
  - Update `periodStart` and `updatedAt`

**Idempotency**: Event ID stored in `stripe_events` collection

---

## Data Model

### Firestore: users/{uid}

```typescript
{
  // Basic fields
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Plan and quota
  plan: "free" | "pro" | "premium",
  quotaLimit: number,               // 3, 100, or 1000
  quotaUsed: number,                // Current usage count
  periodStart: Timestamp,           // Start of current billing period
  
  // Stripe fields (optional, set after subscription)
  stripeCustomerId?: string,        // Stripe customer ID (cus_...)
  subscriptionId?: string           // Stripe subscription ID (sub_...)
}
```

### Firestore: stripe_events/{eventId}

Idempotency tracking:

```typescript
{
  eventId: string,                  // Stripe event ID
  eventType: string,                // Event type (e.g., "invoice.paid")
  processedAt: string               // ISO timestamp
}
```

### Plan Quota Mapping

```typescript
const QUOTA_LIMITS = {
  free: 3,          // 3 conversions per month
  pro: 100,         // 100 conversions per month
  premium: 1000     // 1000 conversions per month
};
```

---

## Security

### 1. Webhook Signature Verification

Every webhook request is verified using Stripe's signature:

```typescript
const event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  webhookSecret
);
```

This prevents:
- Unauthorized webhook calls
- Replay attacks
- Malicious event injection

### 2. Firebase Authentication

Checkout session endpoint requires valid Firebase ID token:

```typescript
const decodedToken = await auth.verifyIdToken(idToken);
const uid = decodedToken.uid;
```

This ensures:
- Only authenticated users can create checkout sessions
- User identity is verified
- No impersonation attacks

### 3. Idempotency

Webhook events are processed exactly once:

```typescript
const isProcessed = await isEventProcessed(event.id);
if (isProcessed) {
  return; // Skip duplicate
}
// ... process event ...
await markEventProcessed(event.id, event.type);
```

This prevents:
- Double-charging users
- Duplicate quota resets
- Race conditions

### 4. Environment Variables

Sensitive data stored securely:

```typescript
// Stored in Firebase Secrets (not in code)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. CORS Protection

Checkout endpoint uses CORS whitelist:

```typescript
const allowedOrigins = [
  'https://photocalia.com',
  'https://www.photocalia.com',
  'http://localhost:4200',  // Dev only
];
```

---

## Testing

### Local Testing with Stripe CLI

1. **Install Stripe CLI**:
   ```bash
   brew install stripe/stripe-cli/stripe
   # or
   curl -s https://packages.stripe.com/api/install/stripe-cli.sh | bash
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local**:
   ```bash
   stripe listen --forward-to http://localhost:5001/YOUR-PROJECT/us-central1/stripeWebhook
   ```

4. **Trigger test events**:
   ```bash
   # Test checkout completion
   stripe trigger checkout.session.completed
   
   # Test invoice paid
   stripe trigger invoice.paid
   
   # Test subscription updated
   stripe trigger customer.subscription.updated
   
   # Test subscription deleted
   stripe trigger customer.subscription.deleted
   ```

### Testing Checkout Flow

1. **Start local emulator**:
   ```bash
   firebase emulators:start
   ```

2. **Get test ID token** (from your app or Firebase Auth)

3. **Create checkout session**:
   ```bash
   curl -X POST http://localhost:5001/YOUR-PROJECT/us-central1/createCheckoutSession \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TEST_TOKEN" \
     -d '{"plan":"pro"}'
   ```

4. **Visit returned URL** and use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

### Monitoring

Check Firebase Functions logs:

```bash
firebase functions:log
```

Check Stripe Dashboard:
- **Payments**: See successful checkouts
- **Customers**: See created customers
- **Subscriptions**: See active subscriptions
- **Webhooks**: See webhook deliveries and retries

---

## Deployment

### Production Deployment

1. **Set production secrets**:
   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY
   # Enter your live secret key (sk_live_...)
   
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   # Enter your production webhook secret (whsec_...)
   ```

2. **Update price IDs** in `functions/src/types/stripe.ts` with live prices

3. **Build and deploy**:
   ```bash
   cd functions
   npm run build
   cd ..
   firebase deploy --only functions:createCheckoutSession,functions:stripeWebhook
   ```

4. **Update webhook endpoint** in Stripe Dashboard:
   - URL: `https://us-central1-YOUR-PROJECT.cloudfunctions.net/stripeWebhook`
   - Mode: Live mode

5. **Test with real payment** (use small amount first!)

### Rollback

If issues occur:

```bash
# Rollback to previous version
firebase functions:rollback createCheckoutSession --revision REVISION_ID
firebase functions:rollback stripeWebhook --revision REVISION_ID
```

---

## Troubleshooting

### Issue: "STRIPE_SECRET_KEY not configured"

**Solution**: Set the secret:
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
```

### Issue: "Webhook signature verification failed"

**Causes**:
1. Wrong webhook secret
2. Raw body not preserved
3. Headers modified

**Solution**:
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Ensure Firebase Functions v2 is used (provides rawBody)
- Check no middleware modifies the request

### Issue: "No user found for customer"

**Causes**:
1. Customer created outside the system
2. Firestore not updated with `stripeCustomerId`

**Solution**:
- Always use `createCheckoutSession` endpoint
- Never create customers manually in Stripe Dashboard
- Check Firestore for `stripeCustomerId` field

### Issue: Webhook not receiving events

**Causes**:
1. Webhook URL not configured
2. Events not selected
3. Endpoint returns error (Stripe stops retrying)

**Solution**:
- Check Stripe Dashboard > Webhooks for delivery status
- Verify endpoint URL is correct
- Check Firebase logs for errors
- Stripe retries failed webhooks automatically

### Issue: Duplicate event processing

**Should not happen** - idempotency is built-in. If it does:

1. Check `stripe_events` collection
2. Verify event IDs are being stored
3. Check for race conditions (multiple functions deployed?)

---

## Best Practices

### 1. Always Use Test Mode First

Use Stripe test keys for development:
- Test secret key: `sk_test_...`
- Test webhook secret: `whsec_test_...`

### 2. Monitor Webhook Deliveries

Check Stripe Dashboard regularly for:
- Failed webhook deliveries
- Retry attempts
- Event processing time

### 3. Log Everything Important

The code logs:
- Customer creation
- Checkout session creation
- Webhook events received
- Subscription activations/cancellations
- Errors and exceptions

### 4. Handle Errors Gracefully

- Webhook errors trigger Stripe retries (up to 3 days)
- Checkout errors return clear messages to user
- Firestore errors are logged but don't block

### 5. Test Idempotency

Manually retry webhook events to ensure no duplicates:
```bash
# Send same event twice
stripe events resend evt_...
stripe events resend evt_...
```

### 6. Keep Price IDs Updated

When changing prices in Stripe:
1. Create new price
2. Update `STRIPE_PRICE_TO_PLAN` mapping
3. Deploy functions
4. Optionally: deprecate old price

---

## Support

### Stripe Resources

- [Stripe API Docs](https://stripe.com/docs/api)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

### Firebase Resources

- [Firebase Functions](https://firebase.google.com/docs/functions)
- [Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Auth](https://firebase.google.com/docs/auth)

### Getting Help

1. Check Firebase Functions logs
2. Check Stripe Dashboard webhooks
3. Search Stripe/Firebase documentation
4. Contact Stripe support (excellent support!)

---

## License

Part of Photocalia - see main project LICENSE.
