/**
 * Stripe Webhook Handler Service
 * Processes Stripe webhook events with idempotency and error handling
 */

import Stripe from "stripe";
import { log } from "firebase-functions/logger";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeFirebaseAdmin } from "../utils/firebase-admin";
import { getStripeInstance } from "../utils/stripe-config";
import { getBillingService } from "./billing";
import { STRIPE_PRICE_TO_PLAN } from "../types/stripe";
import { PlanType } from "../types/quota";

/**
 * Webhook handler service
 * Processes Stripe events and updates Firestore accordingly
 */
export class WebhookHandlerService {
  private stripe: Stripe;
  private db: FirebaseFirestore.Firestore;
  private billingService: ReturnType<typeof getBillingService>;

  constructor() {
    initializeFirebaseAdmin();
    this.stripe = getStripeInstance();
    this.db = getFirestore();
    this.billingService = getBillingService();
  }

  /**
   * Check if event was already processed (idempotency)
   * Stores processed event IDs in Firestore to prevent duplicate processing
   * 
   * @param eventId - Stripe event ID
   * @returns true if already processed, false otherwise
   */
  private async isEventProcessed(eventId: string): Promise<boolean> {
    const eventDoc = await this.db
      .collection("stripe_events")
      .doc(eventId)
      .get();
    return eventDoc.exists;
  }

  /**
   * Mark event as processed (idempotency)
   * Stores event metadata in Firestore
   * 
   * @param eventId - Stripe event ID
   * @param eventType - Event type (e.g., "checkout.session.completed")
   */
  private async markEventProcessed(
    eventId: string,
    eventType: string
  ): Promise<void> {
    await this.db
      .collection("stripe_events")
      .doc(eventId)
      .set({
        eventId,
        eventType,
        processedAt: Timestamp.now(),
      });
  }

  /**
   * Get user ID from customer ID
   * Looks up Firestore to find user with matching stripeCustomerId
   * 
   * @param customerId - Stripe customer ID
   * @returns Firebase user ID or null if not found
   */
  private async getUserIdFromCustomer(
    customerId: string
  ): Promise<string | null> {
    const usersSnapshot = await this.db
      .collection("users")
      .where("stripeCustomerId", "==", customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      log("No user found for customer", { customerId });
      return null;
    }

    return usersSnapshot.docs[0].id;
  }

  /**
   * Handle checkout.session.completed event
   * Updates user subscription when checkout is successful
   * 
   * @param session - Stripe checkout session object
   */
  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    log("Processing checkout.session.completed", { sessionId: session.id });

    const userId = session.metadata?.userId;
    const customerId = session.customer as string;

    if (!userId) {
      log("No userId in session metadata, looking up by customer");
      const foundUserId = await this.getUserIdFromCustomer(customerId);
      if (!foundUserId) {
        throw new Error(`Cannot find user for customer ${customerId}`);
      }
    }

    const uid = userId || (await this.getUserIdFromCustomer(customerId));
    if (!uid) {
      throw new Error("Cannot determine user ID from session");
    }

    // Get subscription details
    const subscriptionId = session.subscription as string;
    if (!subscriptionId) {
      log("No subscription in checkout session", { sessionId: session.id });
      return;
    }

    // Get plan from metadata or subscription
    let plan: PlanType | undefined = session.metadata?.plan as PlanType;

    if (!plan) {
      // Fallback: get plan from subscription line items
      const subscription = await this.stripe.subscriptions.retrieve(
        subscriptionId
      );
      const priceId = subscription.items.data[0]?.price.id;
      plan = STRIPE_PRICE_TO_PLAN[priceId];
    }

    if (!plan || plan === "free") {
      throw new Error(`Invalid plan detected: ${plan}`);
    }

    // Activate subscription in Firestore
    await this.billingService.activateSubscription(uid, plan, subscriptionId);

    log("Checkout completed successfully", { uid, plan, subscriptionId });
  }

  /**
   * Handle invoice.paid event
   * Updates subscription status when invoice is paid
   * 
   * @param invoice - Stripe invoice object
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    log("Processing invoice.paid", { invoiceId: invoice.id });

    const customerId = invoice.customer as string;
    
    // Extract subscription ID from the invoice
    // The subscription field exists in webhook event payloads but may not be in the base type
    // We safely access it using optional chaining and type checking
    const invoiceData = invoice as Stripe.Invoice & { 
      subscription?: string | Stripe.Subscription | null 
    };
    
    let subscriptionId: string | null = null;
    if (typeof invoiceData.subscription === 'string') {
      subscriptionId = invoiceData.subscription;
    } else if (invoiceData.subscription && typeof invoiceData.subscription === 'object') {
      subscriptionId = invoiceData.subscription.id;
    }

    if (!subscriptionId) {
      log("No subscription in invoice", { invoiceId: invoice.id });
      return;
    }

    const uid = await this.getUserIdFromCustomer(customerId);
    if (!uid) {
      throw new Error(`Cannot find user for customer ${customerId}`);
    }

    // Get subscription to find the plan
    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId
    );
    const priceId = subscription.items.data[0]?.price.id;
    const plan = STRIPE_PRICE_TO_PLAN[priceId];

    if (!plan || plan === "free") {
      log("Invalid plan from invoice", { priceId, plan });
      return;
    }

    // Activate/renew subscription
    await this.billingService.activateSubscription(uid, plan, subscriptionId);

    log("Invoice paid and subscription activated", {
      uid,
      plan,
      subscriptionId,
    });
  }

  /**
   * Handle customer.subscription.updated event
   * Updates subscription status when subscription changes
   * 
   * @param subscription - Stripe subscription object
   */
  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription
  ): Promise<void> {
    log("Processing customer.subscription.updated", {
      subscriptionId: subscription.id,
    });

    const customerId = subscription.customer as string;
    const uid = await this.getUserIdFromCustomer(customerId);

    if (!uid) {
      throw new Error(`Cannot find user for customer ${customerId}`);
    }

    // Get plan from subscription
    const priceId = subscription.items.data[0]?.price.id;
    const plan = STRIPE_PRICE_TO_PLAN[priceId];

    if (!plan || plan === "free") {
      log("Invalid plan from subscription", { priceId, plan });
      return;
    }

    // Check subscription status
    if (subscription.status === "active") {
      await this.billingService.activateSubscription(
        uid,
        plan,
        subscription.id
      );
      log("Subscription updated and active", { uid, plan });
    } else if (
      subscription.status === "canceled" ||
      subscription.status === "unpaid"
    ) {
      await this.billingService.downgradeToFree(uid);
      log("Subscription canceled/unpaid, downgraded to free", { uid });
    } else {
      log("Subscription status not handled", {
        uid,
        status: subscription.status,
      });
    }
  }

  /**
   * Handle customer.subscription.deleted event
   * Downgrades user to free plan when subscription is deleted
   * 
   * @param subscription - Stripe subscription object
   */
  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription
  ): Promise<void> {
    log("Processing customer.subscription.deleted", {
      subscriptionId: subscription.id,
    });

    const customerId = subscription.customer as string;
    const uid = await this.getUserIdFromCustomer(customerId);

    if (!uid) {
      throw new Error(`Cannot find user for customer ${customerId}`);
    }

    // Downgrade to free plan
    await this.billingService.downgradeToFree(uid);

    log("Subscription deleted, downgraded to free", { uid });
  }

  /**
   * Process a Stripe webhook event
   * Main entry point for webhook handling with idempotency
   * 
   * @param event - Stripe event object
   */
  async processEvent(event: Stripe.Event): Promise<void> {
    // Check idempotency - skip if already processed
    const isProcessed = await this.isEventProcessed(event.id);
    if (isProcessed) {
      log("Event already processed, skipping", {
        eventId: event.id,
        type: event.type,
      });
      return;
    }

    try {
      // Route event to appropriate handler
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session
          );
          break;

        case "invoice.paid":
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription
          );
          break;

        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription
          );
          break;

        default:
          log("Unhandled event type", { type: event.type });
      }

      // Mark as processed after successful handling
      await this.markEventProcessed(event.id, event.type);

      log("Event processed successfully", {
        eventId: event.id,
        type: event.type,
      });
    } catch (error: any) {
      log("Error processing event", {
        eventId: event.id,
        type: event.type,
        error: error.message,
      });
      // Re-throw to signal failure to Stripe for retry
      throw error;
    }
  }
}

// Singleton instance
let webhookHandlerInstance: WebhookHandlerService | null = null;

/**
 * Get singleton instance of WebhookHandlerService
 */
export function getWebhookHandler(): WebhookHandlerService {
  if (!webhookHandlerInstance) {
    webhookHandlerInstance = new WebhookHandlerService();
  }
  return webhookHandlerInstance;
}
