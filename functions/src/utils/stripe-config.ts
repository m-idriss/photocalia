/**
 * Stripe configuration and initialization
 * Handles Stripe SDK setup with API key management
 */

import Stripe from "stripe";
import { log } from "firebase-functions/logger";

let stripeInstance: Stripe | null = null;

/**
 * Initialize Stripe with API key from environment
 * Singleton pattern to avoid multiple initializations
 */
export function getStripeInstance(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY environment variable is not configured. " +
      "Please set it in Firebase Functions config or environment."
    );
  }

  // Validate key format
  if (!stripeSecretKey.startsWith("sk_")) {
    throw new Error(
      "Invalid STRIPE_SECRET_KEY format. Secret keys should start with 'sk_'"
    );
  }

  // Initialize Stripe with API version pinning for stability
  stripeInstance = new Stripe(stripeSecretKey, {
    apiVersion: "2026-01-28.clover", // Latest stable version
    typescript: true,
    // App info for Stripe dashboard identification
    appInfo: {
      name: "Photocalia",
      version: "1.0.0",
    },
  });

  log("Stripe initialized successfully");
  return stripeInstance;
}

/**
 * Get webhook signing secret from environment
 */
export function getWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET environment variable is not configured. " +
      "Please set it with the webhook signing secret from Stripe Dashboard."
    );
  }

  // Validate secret format
  if (!webhookSecret.startsWith("whsec_")) {
    throw new Error(
      "Invalid STRIPE_WEBHOOK_SECRET format. Webhook secrets should start with 'whsec_'"
    );
  }

  return webhookSecret;
}
