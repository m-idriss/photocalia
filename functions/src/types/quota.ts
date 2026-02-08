/**
 * TypeScript interfaces for Firestore-based quota system
 */

/**
 * Plans with different quota limits
 */
export type PlanType = "free" | "pro" | "premium";

/**
 * Default plan for new users
 */
export const DEFAULT_PLAN: PlanType = "free";

/**
 * Firestore document structure for user quotas
 * Stored at: users/{uid}
 */
export interface UserQuotaDocument {
  plan: PlanType;
  quotaUsed: number;
  quotaLimit: number;
  periodStart: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

/**
 * Quota check result
 */
export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  plan: PlanType;
}

/**
 * Quota limits by plan
 */
export const QUOTA_LIMITS: Record<PlanType, number> = {
  free: 3,
  pro: 100,
  premium: 1000,
};
