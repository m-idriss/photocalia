import { onRequest } from "firebase-functions/v2/https";
import { getQuotaService } from "../services/quota";
import { corsHandler } from "../utils/cors";

/**
 * Function to get quota status for a user
 */
export const quotaStatusFunction = onRequest(
  {
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  (req, res) => {
    return corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST" && req.method !== "GET") {
          return res.status(405).json({ error: "Use POST or GET." });
        }

        const quotaService = getQuotaService();

        // Get userId from request body (POST) or query (GET)
        const userId = req.method === "POST" ? req.body?.userId : req.query.userId as string;


        if (!userId) {
          return res.status(400).json({ error: "userId is required" });
        }

        // Get quota status for the user
        const quotaStatus = await quotaService.getQuotaStatus(userId);

        if (!quotaStatus) {
          // If quota service is disabled or user not found, return default values
          return res.status(200).json({
            success: true,
            quota: {
              usageCount: 0,
              limit: 3,
              remaining: 3,
              plan: "free"
            },
            enabled: false
          });
        }

        return res.status(200).json({
          success: true,
          quota: quotaStatus,
          enabled: true
        });

      } catch (err: any) {
        console.error("Quota status error:", err);
        return res.status(500).json({
          error: "Internal error",
          message: err.message
        });
      }
    });
  }
);
