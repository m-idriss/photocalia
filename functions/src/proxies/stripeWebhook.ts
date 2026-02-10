/**
 * Stripe Webhook Endpoint
 * POST /billing/stripe-webhook
 * 
 * Receives and processes Stripe webhook events
 * Verifies webhook signature for security
 */

import { onRequest } from "firebase-functions/v2/https";
import { log } from "firebase-functions/logger";
import { getStripeInstance } from "../utils/stripe-config";
import { getWebhookSecret } from "../utils/stripe-config";
import { getWebhookHandler } from "../services/webhook-handler";
import Stripe from "stripe";

/**
 * Stripe Webhook Cloud Function
 * 
 * Handles incoming webhook events from Stripe
 * - Verifies signature to ensure authenticity
 * - Processes events idempotently
 * - Updates Firestore based on subscription changes
 * 
 * Security:
 * - Signature verification prevents unauthorized requests
 * - Idempotency prevents duplicate processing
 * - No CORS needed (Stripe-to-server communication)
 */
export const stripeWebhook = onRequest(
  {
    secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (req, res) => {
    try {
      // Only accept POST requests
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed. Use POST." });
        return;
      }

      // Get raw body for signature verification
      // Firebase Functions v2 provides rawBody
      const rawBody = req.rawBody;
      if (!rawBody) {
        log("Missing raw body for signature verification");
        res.status(400).json({ error: "Missing request body" });
        return;
      }

      // Get Stripe signature from headers
      const signature = req.headers["stripe-signature"];
      if (!signature) {
        log("Missing Stripe signature header");
        res.status(400).json({ error: "Missing Stripe signature" });
        return;
      }

      // Get Stripe and webhook secret
      const stripe = getStripeInstance();
      const webhookSecret = getWebhookSecret();

      // Verify webhook signature and construct event
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature as string,
          webhookSecret
        );
      } catch (error: any) {
        log("Webhook signature verification failed", {
          error: error.message,
        });
        res.status(400).json({
          error: "Webhook signature verification failed",
          message: error.message,
        });
        return;
      }

      log("Webhook signature verified", {
        eventId: event.id,
        type: event.type,
      });

      // Process the event
      const webhookHandler = getWebhookHandler();
      await webhookHandler.processEvent(event);

      // Return success response to Stripe
      res.status(200).json({
        received: true,
        eventId: event.id,
      });
    } catch (error: any) {
      log("Webhook processing error", {
        error: error.message,
        stack: error.stack,
      });

      // Return 500 to trigger Stripe retry
      res.status(500).json({
        error: "Webhook processing failed",
        message: error.message,
      });
    }
  }
);
