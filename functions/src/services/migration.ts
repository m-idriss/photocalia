import { Timestamp } from "firebase-admin/firestore";
import { log } from "firebase-functions/logger";
import { getFirestoreQuotaService } from "./firestore-quota";
import { getNotionSyncService } from "./notion-sync";
import { QUOTA_LIMITS } from "../types/quota";

/**
 * Migration utilities for moving legacy users from Notion to Firestore
 */

/**
 * Migrate a single user from Notion to Firestore
 * This reads existing values from Notion and creates the Firestore entry
 * 
 * Usage: Only for legacy users who exist in Notion but not in Firestore
 * 
 * @param uid User ID to migrate
 * @returns true if migration succeeded, false otherwise
 */
export async function migrateUserFromNotion(uid: string): Promise<boolean> {
  const firestoreQuotaService = getFirestoreQuotaService();
  const notionSyncService = getNotionSyncService();

  try {
    log("Starting migration for user", { uid });

    // Read existing data from Notion
    const notionData = await notionSyncService.readFromNotion(uid);

    if (!notionData) {
      log("No Notion data found for user - creating with defaults", { uid });
      // Create new user with default values by calling checkQuota
      // This will auto-create the user with DEFAULT_PLAN
      await firestoreQuotaService.checkQuota(uid);
      return true;
    }

    // Get Firestore reference through proper API
    const userDocRef = firestoreQuotaService.getUserDocumentRef(uid);
    
    // Check if user already exists in Firestore
    const existingDoc = await userDocRef.get();
    if (existingDoc.exists) {
      log("User already exists in Firestore - skipping migration", { uid });
      return false;
    }

    // Create Firestore document with Notion data
    const now = Timestamp.now();
    await userDocRef.set({
      plan: notionData.plan,
      quotaUsed: notionData.usageCount,
      quotaLimit: QUOTA_LIMITS[notionData.plan],
      periodStart: Timestamp.fromDate(notionData.lastReset),
      createdAt: now,
      updatedAt: now,
    });

    log("Successfully migrated user from Notion to Firestore", {
      uid,
      plan: notionData.plan,
      quotaUsed: notionData.usageCount,
    });

    return true;
  } catch (error: any) {
    log("Failed to migrate user from Notion", {
      error: error.message,
      uid,
    });
    return false;
  }
}

/**
 * Batch migrate multiple users from Notion to Firestore
 * 
 * @param uids Array of user IDs to migrate
 * @returns Object with counts of successful and failed migrations
 */
export async function batchMigrateUsersFromNotion(
  uids: string[]
): Promise<{ succeeded: number; failed: number }> {
  let succeeded = 0;
  let failed = 0;

  for (const uid of uids) {
    const result = await migrateUserFromNotion(uid);
    if (result) {
      succeeded++;
    } else {
      failed++;
    }
  }

  log("Batch migration completed", { succeeded, failed, total: uids.length });

  return { succeeded, failed };
}
