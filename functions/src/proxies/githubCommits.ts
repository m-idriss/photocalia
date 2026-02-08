import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import { CacheManager, simpleHash } from "../utils/cache";
import { initializeFirebaseAdmin } from "../utils/firebase-admin";

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

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
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
});

export interface CommitData {
  date: number;
  value: number;
}

// Cache configuration: 1 hour TTL, 5 minute force cooldown
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const FORCE_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export const githubCommits = onRequest(
  { secrets: ["GITHUB_TOKEN"] },
  (req, res) => {
    return corsHandler(req, res, async () => {
      try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
          return res.status(500).json({ error: "GitHub token not configured" });
        }

        const months = parseInt((req.query.months as string) ?? "12", 10);
        const forceRefresh = req.query.force === "true";

        // Create cache manager with dynamic key based on months parameter
        const cache = new CacheManager<CommitData[]>({
          collection: "github-cache",
          key: `commits-${months}`,
          ttl: CACHE_TTL,
          forceCooldown: FORCE_COOLDOWN,
        });

        // Fetch function for GitHub API
        const fetchCommits = async (): Promise<CommitData[]> => {
          const cutoff = new Date();
          cutoff.setMonth(cutoff.getMonth() - months);

          const query = `
            query {
              user(login: "m-idriss") {
                contributionsCollection {
                  contributionCalendar {
                    weeks {
                      contributionDays {
                        contributionCount
                        date
                      }
                    }
                  }
                }
              }
            }
          `;

          const response = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ query }),
          });

          const data: any = await response.json();

          if (data.errors) {
            throw new Error(JSON.stringify(data.errors));
          }

          const weeks = data.data.user.contributionsCollection.contributionCalendar.weeks;
          const commits = weeks.flatMap((week: any) =>
            week.contributionDays
              .map((day: any) => ({
                date: new Date(day.date).getTime(),
                value: day.contributionCount,
              }))
              .filter((d: any) => d.date >= cutoff.getTime())
          );

          return commits;
        };

        // Get data from cache or fetch fresh
        const commits = await cache.get(fetchCommits, simpleHash, forceRefresh);

        return res.status(200).json(commits);
      } catch (err: any) {
        console.error("GitHub commits proxy error:", err);
        return res.status(500).json({ error: err.message });
      }
    });
  }
);
