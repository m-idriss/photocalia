import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import { getQuotaService } from "../services/quota";

// Whitelist of allowed origins for CORS
const allowedOrigins = [
  'https://photocalia.com',
  'https://www.photocalia.com',
  'https://photocalia.com',
  'https://www.photocalia.com',
  'http://localhost:4200',
  'http://localhost:5000'
];

const corsHandler = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser clients
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});

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
