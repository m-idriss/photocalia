import { Client } from "@notionhq/client";
import { log } from "firebase-functions/logger";
import { PlanType, DEFAULT_PLAN } from "../types/quota";

/**
 * Background Notion sync service
 * This service syncs Firestore data to Notion for business reporting/CRM
 * It NEVER blocks API responses and NEVER affects request authorization
 */
export class NotionSyncService {
  private notion?: Client;
  private quotaDbId?: string;
  private isEnabled: boolean;
  private notionToken?: string;

  constructor() {
    this.quotaDbId = process.env.NOTION_QUOTA_DB_ID;
    this.notionToken = process.env.NOTION_TRACKING_TOKEN;
    this.isEnabled = !!(this.quotaDbId && this.notionToken);

    if (this.isEnabled && this.notionToken) {
      this.notion = new Client({ auth: this.notionToken });
      log("Notion sync service ENABLED", { databaseId: this.quotaDbId });
    } else {
      log("Notion sync service DISABLED (missing token or database ID)");
    }
  }

  /**
   * Get page ID for a user's quota entry in Notion
   */
  private async getPageId(userId: string): Promise<string | null> {
    if (!this.isEnabled || !this.quotaDbId || !this.notionToken) return null;

    try {
      const url = `https://api.notion.com/v1/databases/${this.quotaDbId}/query`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.notionToken}`,
          "Notion-Version": "2022-02-22",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filter: {
            property: "User ID",
            title: {
              equals: userId,
            },
          },
        }),
      });

      const data: any = await response.json();
      return data.results && data.results.length > 0 ? data.results[0].id : null;
    } catch (error: any) {
      log("Failed to get Notion page ID (non-blocking)", {
        error: error.message,
        userId,
      });
      return null;
    }
  }

  /**
   * Sync user quota to Notion (background, non-blocking)
   * This is called asynchronously after Firestore updates
   * If it fails, it only logs an error - it NEVER blocks the request
   */
  async syncToNotion(
    userId: string,
    quotaUsed: number,
    plan: PlanType,
    periodStart: Date
  ): Promise<void> {
    if (!this.isEnabled || !this.notion || !this.quotaDbId) {
      return; // Silently skip if Notion is disabled
    }

    try {
      const pageId = await this.getPageId(userId);

      const properties: Record<string, any> = {
        "User ID": { title: [{ text: { content: userId } }] },
        "Usage Count": { number: quotaUsed },
        "Last Reset": { date: { start: periodStart.toISOString() } },
        Plan: { select: { name: plan } },
      };

      if (pageId) {
        // Update existing page
        await this.notion.pages.update({
          page_id: pageId,
          properties,
        });
        log("Synced quota to Notion (updated)", { userId, quotaUsed, plan });
      } else {
        // Create new page
        await this.notion.pages.create({
          parent: { type: "database_id", database_id: this.quotaDbId },
          properties,
        });
        log("Synced quota to Notion (created)", { userId, quotaUsed, plan });
      }
    } catch (error: any) {
      // Only log error - NEVER throw or block
      log("Failed to sync to Notion (non-blocking)", {
        error: error.message,
        userId,
      });
    }
  }

  /**
   * Read user data from Notion (for legacy migration only)
   */
  async readFromNotion(userId: string): Promise<{
    usageCount: number;
    lastReset: Date;
    plan: PlanType;
  } | null> {
    if (!this.isEnabled || !this.quotaDbId || !this.notionToken) return null;

    try {
      const url = `https://api.notion.com/v1/databases/${this.quotaDbId}/query`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.notionToken}`,
          "Notion-Version": "2022-02-22",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filter: {
            property: "User ID",
            title: {
              equals: userId,
            },
          },
        }),
      });

      const data: any = await response.json();

      if (!data.results || data.results.length === 0) {
        return null;
      }

      const page: any = data.results[0];
      const props = page.properties;

      return {
        usageCount: props["Usage Count"]?.number ?? 0,
        lastReset: new Date(props["Last Reset"]?.date?.start ?? new Date()),
        plan: (props["Plan"]?.select?.name ?? DEFAULT_PLAN) as PlanType,
      };
    } catch (error: any) {
      log("Failed to read from Notion", { error: error.message, userId });
      return null;
    }
  }
}

// Singleton instance
let notionSyncServiceInstance: NotionSyncService | null = null;

export function getNotionSyncService(): NotionSyncService {
  if (!notionSyncServiceInstance) {
    notionSyncServiceInstance = new NotionSyncService();
  }
  return notionSyncServiceInstance;
}
