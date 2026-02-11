import { onRequest } from "firebase-functions/v2/https";
import { CacheManager, simpleHash } from "../utils/cache";
import { initializeFirebaseAdmin } from "../utils/firebase-admin";
import { corsHandler } from "../utils/cors";

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

type GitHubError = { message?: string };

// Cache configuration: 1 hour TTL, 5 minute force cooldown
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const FORCE_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export const githubSocial = onRequest(
  { secrets: ["GITHUB_TOKEN"] },
  (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
          res.status(500).json({ error: "GitHub token not configured" });
          return;
        }

        const target = req.query.target as string;
        const forceRefresh = req.query.force === "true";
        const isSocial = target === "social";

        // Create cache manager with key based on target
        const cache = new CacheManager<any>({
          collection: "github-cache",
          key: isSocial ? "social-links" : "profile",
          ttl: CACHE_TTL,
          forceCooldown: FORCE_COOLDOWN,
        });

        // Fetch function for GitHub API
        const fetchGitHubData = async (): Promise<any> => {
          const apiUrl = new URL(`https://api.github.com/users/m-idriss`);
          if (isSocial) {
            apiUrl.pathname += "/social_accounts";
          }

          const response = await fetch(apiUrl.toString(), {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "User-Agent": "firebase-function-proxy",
            },
          });

          if (!response.ok) {
            const errBody = (await response.json().catch(() => ({}))) as GitHubError;
            throw new Error(errBody.message || "GitHub API error");
          }

          return await response.json();
        };

        // Get data from cache or fetch fresh
        const data = await cache.get(fetchGitHubData, simpleHash, forceRefresh);

        res.status(200).json(data);

      } catch (err: any) {
        console.error("GitHub proxy error:", err);
        res.status(500).json({ error: err.message });
      }
    });
  }
);
