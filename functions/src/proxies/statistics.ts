import { onRequest } from "firebase-functions/v2/https";
import { getTrackingService } from "../services/tracking";
import { log } from "firebase-functions/logger";
import { CacheManager, simpleHash } from "../utils/cache";
import { initializeFirebaseAdmin } from "../utils/firebase-admin";
import { corsHandler } from "../utils/cors";

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

// Cache configuration: 5 minutes TTL, 1 minute force cooldown
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes (statistics change more frequently)
const FORCE_COOLDOWN = 60 * 1000; // 1 minute

interface Statistics {
  fileCount: number;
  eventCount: number;
  message?: string;
}

/**
 * Firebase function to retrieve aggregated statistics
 * Returns total file count and event count from successful conversions
 * Uses backend caching to improve performance
 */
export const statisticsFunction = onRequest(
  {
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  (req, res) => {
    return corsHandler(req, res, async () => {
      try {
        // Only allow GET requests
        if (req.method !== "GET") {
          return res.status(405).json({ error: "Only GET requests are allowed" });
        }

        const forceRefresh = req.query.force === "true";

        // Create cache manager
        const cache = new CacheManager<Statistics>({
          collection: "stats-cache",
          key: "statistics",
          ttl: CACHE_TTL,
          forceCooldown: FORCE_COOLDOWN,
        });

        // Fetch function for statistics
        const fetchStatistics = async (): Promise<Statistics> => {
          const trackingService = getTrackingService();
          const statistics = await trackingService.getStatistics();

          // If tracking is disabled or query fails, return default values
          if (!statistics) {
            log("Returning default statistics (tracking disabled or query failed)");
            return {
              fileCount: 0,
              eventCount: 0,
              message: "Statistics tracking is not available"
            };
          }

          return {
            fileCount: statistics.fileCount,
            eventCount: statistics.eventCount,
          };
        };

        // Get data from cache or fetch fresh
        const data = await cache.get(fetchStatistics, simpleHash, forceRefresh);

        return res.status(200).json(data);
      } catch (error: any) {
        log("Error retrieving statistics", { error: error.message });
        return res.status(500).json({
          error: "Failed to retrieve statistics",
          fileCount: 0,
          eventCount: 0,
        });
      }
    });
  }
);
