import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import { migrateUserFromNotion, batchMigrateUsersFromNotion } from "../services/migration";

// Whitelist of allowed origins for CORS
const allowedOrigins = [
  'https://3dime.com',
  'https://www.3dime.com',
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
 * Function to migrate users from Notion to Firestore
 * 
 * Single user: POST { "userId": "user@example.com" }
 * Multiple users: POST { "userIds": ["user1@example.com", "user2@example.com"] }
 */
export const migrateQuotaFunction = onRequest(
  {
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  (req, res) => {
    return corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Use POST." });
        }

        const { userId, userIds } = req.body;

        // Single user migration
        if (userId) {
          const success = await migrateUserFromNotion(userId);
          
          if (success) {
            return res.status(200).json({
              success: true,
              message: `User ${userId} migrated successfully`,
            });
          } else {
            return res.status(400).json({
              success: false,
              message: `User ${userId} already exists or migration failed`,
            });
          }
        }

        // Batch migration
        if (userIds && Array.isArray(userIds)) {
          const result = await batchMigrateUsersFromNotion(userIds);
          
          return res.status(200).json({
            success: true,
            message: "Batch migration completed",
            result: {
              total: userIds.length,
              succeeded: result.succeeded,
              failed: result.failed,
            },
          });
        }

        return res.status(400).json({
          error: "Missing userId or userIds in request body",
        });

      } catch (err: any) {
        console.error("Migration error:", err);
        return res.status(500).json({
          error: "Internal error",
          message: err.message,
        });
      }
    });
  }
);
