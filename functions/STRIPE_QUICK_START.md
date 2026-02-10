# Stripe Integration - Quick Start Guide

This guide helps you get the Stripe integration up and running quickly.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Firebase project with Functions enabled
- Node.js 20+ installed

## Step-by-Step Setup

### 1. Create Stripe Products

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Products** → **Add product**
3. Create two products:

**Pro Plan:**
- Name: `Photocalia Pro`
- Description: `100 conversions per month`
- Pricing: Recurring, Monthly
- Price: Your choice (e.g., $9.99/month)
- Copy the **Price ID** (starts with `price_`)

**Premium Plan:**
- Name: `Photocalia Premium`
- Description: `1000 conversions per month`
- Pricing: Recurring, Monthly
- Price: Your choice (e.g., $29.99/month)
- Copy the **Price ID** (starts with `price_`)

### 2. Update Price Mappings

Edit `functions/src/types/stripe.ts`:

```typescript
export const STRIPE_PRICE_TO_PLAN: Record<string, PlanType> = {
  "price_YOUR_PRO_PRICE_ID": "pro",          // ← Replace with your Pro price ID
  "price_YOUR_PREMIUM_PRICE_ID": "premium",  // ← Replace with your Premium price ID
};

export const PLAN_TO_STRIPE_PRICE: Record<PlanType, string | null> = {
  free: null,
  pro: "price_YOUR_PRO_PRICE_ID",            // ← Replace with your Pro price ID
  premium: "price_YOUR_PREMIUM_PRICE_ID",    // ← Replace with your Premium price ID
};
```

### 3. Set Up Secrets

Get your API keys from Stripe Dashboard → **Developers** → **API keys**:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set Stripe secret key (use test key first!)
firebase functions:secrets:set STRIPE_SECRET_KEY
# When prompted, paste: sk_test_...

# You'll set STRIPE_WEBHOOK_SECRET after creating the webhook (step 5)
```

### 4. Deploy Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build
npm run build

# Deploy
cd ..
firebase deploy --only functions:createCheckoutSession,functions:stripeWebhook
```

Note the deployed URLs, e.g.:
- `https://us-central1-YOUR-PROJECT.cloudfunctions.net/createCheckoutSession`
- `https://us-central1-YOUR-PROJECT.cloudfunctions.net/stripeWebhook`

### 5. Configure Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter webhook URL: `https://us-central1-YOUR-PROJECT.cloudfunctions.net/stripeWebhook`
4. Select events:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.paid`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Set it in Firebase:

```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# When prompted, paste: whsec_...
```

### 6. Test with Stripe Test Mode

Use Stripe's test mode to verify everything works:

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

**Test Expiry:** Any future date (e.g., 12/34)
**Test CVC:** Any 3 digits (e.g., 123)
**Test ZIP:** Any 5 digits (e.g., 12345)

### 7. Integration Code Example

See `EXAMPLE_USAGE.md` for frontend integration code.

## Verification Checklist

After setup, verify:

- [ ] Price IDs updated in `stripe.ts`
- [ ] `STRIPE_SECRET_KEY` set in Firebase secrets
- [ ] `STRIPE_WEBHOOK_SECRET` set in Firebase secrets
- [ ] Functions deployed successfully
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook events selected (4 events)
- [ ] Test purchase completes successfully
- [ ] User document updated in Firestore after purchase
- [ ] Webhook logs show successful processing

## Going Live

When ready for production:

1. **Switch to Live Mode** in Stripe Dashboard (toggle in top right)
2. **Get Live API Keys** from Developers → API keys
3. **Update Live Secrets:**
   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY
   # Enter live key: sk_live_...
   ```
4. **Update Webhook:**
   - Create new webhook endpoint in Live mode
   - Copy live signing secret
   - Update secret:
   ```bash
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   # Enter live secret: whsec_...
   ```
5. **Deploy** (if any code changes)
6. **Test** with a real card (small amount first!)

## Monitoring

Check these regularly:

1. **Firebase Console** → Functions → Logs
2. **Stripe Dashboard** → Developers → Webhooks (delivery status)
3. **Stripe Dashboard** → Payments (successful checkouts)
4. **Firestore Console** → users collection (verify updates)

## Troubleshooting

See `STRIPE_INTEGRATION.md` for detailed troubleshooting guide.

Common issues:
- **403 CORS error**: Check allowed origins in `createCheckoutSession.ts`
- **Webhook signature failed**: Verify `STRIPE_WEBHOOK_SECRET` matches dashboard
- **No user found**: User must authenticate before creating checkout session

## Support

- Stripe Docs: https://stripe.com/docs
- Firebase Docs: https://firebase.google.com/docs/functions
- Stripe Support: https://support.stripe.com/

---

**Next Steps:**
1. Follow this guide to set up Stripe
2. Read `EXAMPLE_USAGE.md` for frontend integration
3. Read `STRIPE_INTEGRATION.md` for comprehensive documentation
