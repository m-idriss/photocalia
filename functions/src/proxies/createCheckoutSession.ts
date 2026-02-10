/**
 * Create Checkout Session Endpoint
 * POST /billing/create-checkout-session
 * 
 * Creates a Stripe checkout session for subscription purchases
 * Requires Firebase authentication
 */

import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import { getAuth } from "firebase-admin/auth";
import { log } from "firebase-functions/logger";
import { initializeFirebaseAdmin } from "../utils/firebase-admin";
import { getBillingService } from "../services/billing";
import { PlanType } from "../types/quota";

// Whitelist of allowed origins for CORS
const allowedOrigins = [
  "https://photocalia.com",
  "https://www.photocalia.com",
  "http://localhost:4200",
  "http://localhost:5000",
];

const corsHandler = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});

/**
 * Verify Firebase ID token from request
 * 
 * @param authHeader - Authorization header value
 * @returns User ID (uid) from verified token
 */
async function verifyFirebaseToken(authHeader: string | undefined): Promise<string> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const idToken = authHeader.split("Bearer ")[1];
  if (!idToken) {
    throw new Error("No ID token provided");
  }

  initializeFirebaseAdmin();
  const auth = getAuth();
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error: any) {
    log("Token verification failed", { error: error.message });
    throw new Error("Invalid or expired token");
  }
}

/**
 * Create Checkout Session Cloud Function
 * 
 * Request body:
 * - plan: "pro" | "premium" (required)
 * - successUrl: string (optional, defaults to app URL)
 * - cancelUrl: string (optional, defaults to app URL)
 * 
 * Response:
 * - url: Stripe checkout session URL
 */
export const createCheckoutSession = onRequest(
  {
    secrets: ["STRIPE_SECRET_KEY"],
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  (req, res) => {
    return corsHandler(req, res, async () => {
      try {
        // Only accept POST requests
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed. Use POST." });
        }

        // Verify Firebase ID token
        let uid: string;
        try {
          uid = await verifyFirebaseToken(req.headers.authorization);
        } catch (error: any) {
          return res.status(401).json({
            error: "Authentication failed",
            message: error.message,
          });
        }

        // Parse request body
        const { plan, successUrl, cancelUrl } = req.body;

        // Validate plan
        if (!plan) {
          return res.status(400).json({ error: "Plan is required" });
        }

        if (plan !== "pro" && plan !== "premium") {
          return res.status(400).json({
            error: "Invalid plan. Must be 'pro' or 'premium'",
          });
        }

        // Get user email for Stripe customer
        const auth = getAuth();
        const userRecord = await auth.getUser(uid);
        const email = userRecord.email;

        // Default URLs
        const defaultSuccessUrl = "https://photocalia.com/success";
        const defaultCancelUrl = "https://photocalia.com/pricing";

        const finalSuccessUrl = successUrl || defaultSuccessUrl;
        const finalCancelUrl = cancelUrl || defaultCancelUrl;

        // Create checkout session
        const billingService = getBillingService();
        const checkoutUrl = await billingService.createCheckoutSession(
          uid,
          plan as PlanType,
          finalSuccessUrl,
          finalCancelUrl,
          email
        );

        log("Checkout session created", { uid, plan });

        return res.status(200).json({
          url: checkoutUrl,
        });
      } catch (error: any) {
        log("Error creating checkout session", {
          error: error.message,
          stack: error.stack,
        });

        return res.status(500).json({
          error: "Failed to create checkout session",
          message: error.message,
        });
      }
    });
  }
);
