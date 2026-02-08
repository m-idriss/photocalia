import { log } from "firebase-functions/logger";
import { getFirestoreQuotaService } from "./firestore-quota";
import { getNotionSyncService } from "./notion-sync";
import { PlanType, QuotaCheckResult } from "../types/quota";

/**
 * Unified Quota Service
 * 
 * Architecture:
 * - Firestore is the PRIMARY source of truth for all quota operations
 * - Notion is used ONLY for async background sync (CRM/reporting)
 * - The API NEVER depends on Notion for authorization decisions
 * - System continues to work perfectly even if Notion is completely down
 */
export class QuotaService {
  private firestoreService = getFirestoreQuotaService();
  private notionSyncService = getNotionSyncService();

  /**
   * Check if user has quota available
   * ONLY reads from Firestore (never Notion)
   * Auto-resets if new month started
   * Returns: { allowed: boolean, remaining: number, limit: number, plan }
   */
  async checkQuota(userId: string): Promise<QuotaCheckResult> {
    return this.firestoreService.checkQuota(userId);
  }

  /**
   * Increment usage count for a user
   * Uses atomic Firestore increment
   * Syncs to Notion in background (non-blocking)
   */
  async incrementUsage(userId: string): Promise<void> {
    // Increment in Firestore (primary)
    await this.firestoreService.incrementUsage(userId);

    // Sync to Notion in background (non-blocking, fire-and-forget)
    this.syncToNotionBackground(userId).catch((err) => {
      log("Background Notion sync failed (non-critical)", {
        error: err.message,
        userId,
      });
    });
  }

  /**
   * Get current quota status for a user
   */
  async getQuotaStatus(
    userId: string
  ): Promise<{ usageCount: number; limit: number; remaining: number; plan: PlanType } | null> {
    return this.firestoreService.getQuotaStatus(userId);
  }

  /**
   * Update user plan (for admin operations)
   */
  async updateUserPlan(userId: string, plan: PlanType): Promise<void> {
    await this.firestoreService.updateUserPlan(userId, plan);

    // Sync to Notion in background
    this.syncToNotionBackground(userId).catch((err) => {
      log("Background Notion sync failed (non-critical)", {
        error: err.message,
        userId,
      });
    });
  }

  /**
   * Background sync to Notion (non-blocking)
   * This is called asynchronously and never blocks the main flow
   */
  private async syncToNotionBackground(userId: string): Promise<void> {
    try {
      // Get user document to retrieve periodStart
      const userDocRef = this.firestoreService.getUserDocumentRef(userId);
      const userDoc = await userDocRef.get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const status = await this.firestoreService.getQuotaStatus(userId);
        
        if (status && userData) {
          const periodStart = userData.periodStart?.toDate() || new Date();
          
          await this.notionSyncService.syncToNotion(
            userId,
            status.usageCount,
            status.plan,
            periodStart
          );
        }
      }
    } catch (error: any) {
      // Just log, don't throw - this is background sync
      log("Notion sync error (non-blocking)", { error: error.message, userId });
    }
  }
}

// Singleton instance
let quotaServiceInstance: QuotaService | null = null;

export function getQuotaService(): QuotaService {
  if (!quotaServiceInstance) {
    quotaServiceInstance = new QuotaService();
  }
  return quotaServiceInstance;
}

// Re-export types for backward compatibility
export type { PlanType } from "../types/quota";
