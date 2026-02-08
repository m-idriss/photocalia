import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { log } from "firebase-functions/logger";
import { initializeFirebaseAdmin } from "../utils/firebase-admin";
import {
  PlanType,
  UserQuotaDocument,
  QuotaCheckResult,
  QUOTA_LIMITS,
  DEFAULT_PLAN,
} from "../types/quota";

/**
 * Firestore-based quota service
 * This is the primary source of truth for user quotas
 */
export class FirestoreQuotaService {
  private db: FirebaseFirestore.Firestore;

  constructor() {
    initializeFirebaseAdmin();
    this.db = getFirestore();
  }

  /**
   * Get the current quota limit for a plan
   */
  private getQuotaLimit(plan: PlanType): number {
    return QUOTA_LIMITS[plan];
  }

  /**
   * Check if a new month has started since the period start
   */
  private isNewMonth(periodStart: Timestamp): boolean {
    const now = new Date();
    const periodDate = periodStart.toDate();
    
    return (
      periodDate.getMonth() !== now.getMonth() ||
      periodDate.getFullYear() !== now.getFullYear()
    );
  }

  /**
   * Get user document reference
   */
  private getUserDocRef(uid: string) {
    return this.db.collection("users").doc(uid);
  }

  /**
   * Create a new user with FREE plan
   * Auto-initialization for new users
   */
  private async createUser(uid: string): Promise<UserQuotaDocument> {
    const now = Timestamp.now();
    const newUser: UserQuotaDocument = {
      plan: DEFAULT_PLAN,
      quotaUsed: 0,
      quotaLimit: QUOTA_LIMITS[DEFAULT_PLAN],
      periodStart: now,
      createdAt: now,
      updatedAt: now,
    };

    await this.getUserDocRef(uid).set(newUser);
    log("Created new user with FREE plan", { uid });
    
    return newUser;
  }

  /**
   * Reset quota usage for a new month
   */
  private async resetQuota(uid: string, plan: PlanType): Promise<void> {
    const now = Timestamp.now();
    await this.getUserDocRef(uid).update({
      quotaUsed: 0,
      periodStart: now,
      updatedAt: now,
    });
    
    log("Reset quota for new month", { uid, plan });
  }

  /**
   * Check if user has quota available
   * ONLY reads from Firestore (never Notion)
   * Auto-resets if new month started
   * Returns: { allowed: boolean, remaining: number, limit: number, plan }
   */
  async checkQuota(uid: string): Promise<QuotaCheckResult> {
    try {
      const userDoc = await this.getUserDocRef(uid).get();

      // If user doesn't exist, create with FREE plan
      if (!userDoc.exists) {
        const newUser = await this.createUser(uid);
        return {
          allowed: true,
          remaining: newUser.quotaLimit,
          limit: newUser.quotaLimit,
          plan: newUser.plan,
        };
      }

      const userData = userDoc.data() as UserQuotaDocument;

      // Reset quota if it's a new month
      if (this.isNewMonth(userData.periodStart)) {
        await this.resetQuota(uid, userData.plan);
        userData.quotaUsed = 0;
      }

      const limit = this.getQuotaLimit(userData.plan);
      const remaining = Math.max(0, limit - userData.quotaUsed);
      const allowed = userData.quotaUsed < limit;

      return {
        allowed,
        remaining,
        limit,
        plan: userData.plan,
      };
    } catch (error: any) {
      log("Error checking quota - allowing by default", {
        error: error.message,
        uid,
      });
      // On error, allow the request to avoid blocking legitimate users
      return {
        allowed: true,
        remaining: -1,
        limit: -1,
        plan: DEFAULT_PLAN,
      };
    }
  }

  /**
   * Increment usage count for a user
   * Uses FieldValue.increment(1) for atomic operation
   * Optimized for high traffic
   */
  async incrementUsage(uid: string): Promise<void> {
    try {
      const userDocRef = this.getUserDocRef(uid);
      const userDoc = await userDocRef.get();

      // If user doesn't exist, create them first
      if (!userDoc.exists) {
        await this.createUser(uid);
      }

      // Use atomic increment
      await userDocRef.update({
        quotaUsed: FieldValue.increment(1),
        updatedAt: Timestamp.now(),
      });

      log("Incremented quota usage", { uid });
    } catch (error: any) {
      log("Error incrementing quota usage", {
        error: error.message,
        uid,
      });
      // Don't throw - we don't want to block the user's request
    }
  }

  /**
   * Get current quota status for a user
   */
  async getQuotaStatus(
    uid: string
  ): Promise<{
    usageCount: number;
    limit: number;
    remaining: number;
    plan: PlanType;
  } | null> {
    try {
      const userDoc = await this.getUserDocRef(uid).get();

      if (!userDoc.exists) {
        // Return default values for non-existent user
        return {
          usageCount: 0,
          limit: QUOTA_LIMITS[DEFAULT_PLAN],
          remaining: QUOTA_LIMITS[DEFAULT_PLAN],
          plan: DEFAULT_PLAN,
        };
      }

      const userData = userDoc.data() as UserQuotaDocument;

      // Reset if it's a new month
      let quotaUsed = userData.quotaUsed;
      if (this.isNewMonth(userData.periodStart)) {
        quotaUsed = 0;
      }

      const limit = this.getQuotaLimit(userData.plan);
      const remaining = Math.max(0, limit - quotaUsed);

      return {
        usageCount: quotaUsed,
        limit,
        remaining,
        plan: userData.plan,
      };
    } catch (error: any) {
      log("Error getting quota status", { error: error.message, uid });
      return null;
    }
  }

  /**
   * Update user plan (for admin operations)
   */
  async updateUserPlan(uid: string, plan: PlanType): Promise<void> {
    const userDocRef = this.getUserDocRef(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      await this.createUser(uid);
    }

    await userDocRef.update({
      plan,
      quotaLimit: QUOTA_LIMITS[plan],
      updatedAt: Timestamp.now(),
    });

    log("Updated user plan", { uid, plan });
  }

  /**
   * Get Firestore reference for a user document
   * Used by migration service
   */
  getUserDocumentRef(uid: string) {
    return this.getUserDocRef(uid);
  }
}

// Singleton instance
let firestoreQuotaServiceInstance: FirestoreQuotaService | null = null;

export function getFirestoreQuotaService(): FirestoreQuotaService {
  if (!firestoreQuotaServiceInstance) {
    firestoreQuotaServiceInstance = new FirestoreQuotaService();
  }
  return firestoreQuotaServiceInstance;
}
