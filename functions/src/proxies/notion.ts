import { onRequest } from "firebase-functions/v2/https";
import { CacheManager, simpleHash } from "../utils/cache";
import { initializeFirebaseAdmin } from "../utils/firebase-admin";
import { fetchNotionData, NotionData } from "../utils/notion";
import { corsHandler } from "../utils/cors";

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

// Cache configuration: 24 hour TTL (longer since webhook updates cache proactively), 5 minute force cooldown
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const FORCE_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export const notionFunction = onRequest(
  { secrets: ["NOTION_TOKEN", "NOTION_DATASOURCE_ID"] },
  async (req, res) => {
    return corsHandler(req, res, async () => {
      try {
        const forceRefresh = req.query.force === "true";
        const token = process.env.NOTION_TOKEN;
        const dataSourceId = process.env.NOTION_DATASOURCE_ID;

        if (!token || !dataSourceId) {
          return res.status(400).json({ error: "Missing NOTION_TOKEN or NOTION_DATASOURCE_ID" });
        }

        // Create cache manager
        const cache = new CacheManager<NotionData>({
          collection: "notion-cache",
          key: "data",
          ttl: CACHE_TTL,
          forceCooldown: FORCE_COOLDOWN,
        });

        // Get data from cache or fetch fresh
        const data = await cache.get(
          () => fetchNotionData(token, dataSourceId),
          simpleHash,
          forceRefresh
        );

        return res.status(200).json(data);
      } catch (err: any) {
        console.error("Notion proxy error:", err);
        return res.status(500).json({ error: err.message });
      }
    });
  }
);
