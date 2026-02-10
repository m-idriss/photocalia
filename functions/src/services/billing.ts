/**
 * Stripe Billing Service
 * Handles customer management, checkout sessions, and subscription operations
 */

import Stripe from "stripe";
import { log } from "firebase-functions/logger";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeFirebaseAdmin } from "../utils/firebase-admin";
import { getStripeInstance } from "../utils/stripe-config";
import { PLAN_TO_STRIPE_PRICE } from "../types/stripe";
import { PlanType, QUOTA_LIMITS } from "../types/quota";

/**
 * Billing service for Stripe operations
 * Manages customers, subscriptions, and checkout sessions
 */
export class BillingService {
  private stripe: Stripe;
  private db: FirebaseFirestore.Firestore;

  constructor() {
    initializeFirebaseAdmin();
    this.stripe = getStripeInstance();
    this.db = getFirestore();
  }

  /**
   * Get or create a Stripe customer for a user
   * Stores stripeCustomerId in Firestore for future reference
   * 
   * @param uid - Firebase user ID
   * @param email - User email (optional, for customer creation)
   * @returns Stripe customer ID
   */
  async getOrCreateCustomer(uid: string, email?: string): Promise<string> {
    const userDocRef = this.db.collection("users").doc(uid);
    const userDoc = await userDocRef.get();

    // Check if customer already exists
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.stripeCustomerId) {
        log("Existing Stripe customer found", { uid, customerId: userData.stripeCustomerId });
        return userData.stripeCustomerId;
      }
    }

    // Create new Stripe customer
    const customer = await this.stripe.customers.create({
      metadata: {
        firebaseUID: uid,
      },
      email: email,
    });

    log("Created new Stripe customer", { uid, customerId: customer.id });

    // Store customer ID in Firestore
    await userDocRef.set(
      {
        stripeCustomerId: customer.id,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    return customer.id;
  }

  /**
   * Create a Stripe Checkout session for subscription
   * 
   * @param uid - Firebase user ID
   * @param plan - Subscription plan (pro or premium)
   * @param successUrl - URL to redirect after successful payment
   * @param cancelUrl - URL to redirect if user cancels
   * @param email - User email (optional)
   * @returns Checkout session URL
   */
  async createCheckoutSession(
    uid: string,
    plan: PlanType,
    successUrl: string,
    cancelUrl: string,
    email?: string
  ): Promise<string> {
    // Validate plan (free plan cannot have checkout)
    if (plan === "free") {
      throw new Error("Cannot create checkout session for free plan");
    }

    // Get price ID for the plan
    const priceId = PLAN_TO_STRIPE_PRICE[plan];
    if (!priceId) {
      throw new Error(`No price ID configured for plan: ${plan}`);
    }

    // Get or create Stripe customer
    const customerId = await this.getOrCreateCustomer(uid, email);

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: uid,
        plan: plan,
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect billing address
      billing_address_collection: "auto",
    });

    log("Created checkout session", {
      uid,
      plan,
      sessionId: session.id,
      customerId,
    });

    if (!session.url) {
      throw new Error("Checkout session URL is missing");
    }

    return session.url;
  }

  /**
   * Update user subscription in Firestore
   * Called when subscription becomes active
   * 
   * @param uid - Firebase user ID
   * @param plan - New subscription plan
   * @param subscriptionId - Stripe subscription ID
   */
  async activateSubscription(
    uid: string,
    plan: PlanType,
    subscriptionId: string
  ): Promise<void> {
    const userDocRef = this.db.collection("users").doc(uid);
    const now = Timestamp.now();

    await userDocRef.set(
      {
        plan: plan,
        quotaLimit: QUOTA_LIMITS[plan],
        quotaUsed: 0, // Reset quota on activation
        periodStart: now,
        subscriptionId: subscriptionId,
        updatedAt: now,
      },
      { merge: true }
    );

    log("Activated subscription", { uid, plan, subscriptionId });
  }

  /**
   * Downgrade user to free plan
   * Called when subscription is canceled or payment fails
   * 
   * @param uid - Firebase user ID
   */
  async downgradeToFree(uid: string): Promise<void> {
    const userDocRef = this.db.collection("users").doc(uid);
    const now = Timestamp.now();

    await userDocRef.set(
      {
        plan: "free",
        quotaLimit: QUOTA_LIMITS["free"],
        quotaUsed: 0, // Reset quota on downgrade
        periodStart: now,
        subscriptionId: null,
        updatedAt: now,
      },
      { merge: true }
    );

    log("Downgraded user to free plan", { uid });
  }

  /**
   * Get Stripe customer ID from Firestore
   * 
   * @param uid - Firebase user ID
   * @returns Stripe customer ID or null if not found
   */
  async getCustomerId(uid: string): Promise<string | null> {
    const userDoc = await this.db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }
    const userData = userDoc.data();
    return userData?.stripeCustomerId || null;
  }
}

// Singleton instance
let billingServiceInstance: BillingService | null = null;

/**
 * Get singleton instance of BillingService
 */
export function getBillingService(): BillingService {
  if (!billingServiceInstance) {
    billingServiceInstance = new BillingService();
  }
  return billingServiceInstance;
}
