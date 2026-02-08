import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import cors from "cors";
import { log } from "firebase-functions/logger";
export { githubCommits } from "./proxies/githubCommits";
export { githubSocial } from "./proxies/githubSocial";
export { notionFunction } from "./proxies/notion";
export { notionWebhook } from "./proxies/notionWebhook";
export { converterFunction } from "./proxies/converter";
export { statisticsFunction } from "./proxies/statistics";
export { quotaStatusFunction } from "./proxies/quotaStatus";
export { migrateQuotaFunction } from "./proxies/migrateQuota";

setGlobalOptions({ maxInstances: 10 });

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

export const proxyApi = onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      const target = req.query.target as string;
      if (!target) {
        return res.status(400).json({ error: "Missing target" });
      }

      const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";

      const localBaseUrl = req.protocol + "://" + req.get("host") + "/image-to-ics/us-central1";

      log("Proxying request", {
        target: target,
        URL: localBaseUrl,
        method: req.method,
        headers: req.headers,
        emulator: isEmulator,
        GCP_PROJECT: process.env.GCP_PROJECT,
        GCLOUD_PROJECT: process.env.GCLOUD_PROJECT,
      });

      const targets: Record<string, string> = isEmulator
        ? {
            profile: `${localBaseUrl}/githubSocial`,
            social: `${localBaseUrl}/githubSocial?target=social`,
            commit: `${localBaseUrl}/githubCommits`,
            notion: `${localBaseUrl}/notionFunction`,
            converter: `${localBaseUrl}/converterFunction`,
            statistics: `${localBaseUrl}/statisticsFunction`,
            quotaStatus: `${localBaseUrl}/quotaStatusFunction`,
          }
        : {
            profile: "https://githubsocial-fuajdt22nq-uc.a.run.app",
            social: "https://githubsocial-fuajdt22nq-uc.a.run.app?target=social",
            commit: "https://githubcommits-fuajdt22nq-uc.a.run.app",
            notion: "https://notionfunction-fuajdt22nq-uc.a.run.app",
            converter: "https://converterfunction-fuajdt22nq-uc.a.run.app",
            statistics: "https://statisticsfunction-fuajdt22nq-uc.a.run.app",
            quotaStatus: "https://quotastatusfunction-fuajdt22nq-uc.a.run.app",
        };

      if (!targets[target]) {
        return res.status(400).json({ error: "Invalid target" });
      }

      let url = targets[target];

      if (target === "commit" && req.query.months) {
        url += `?months=${req.query.months}`;
      }

      const response = await fetch(url, {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
          "Origin": req.headers.origin || "",
        },
        body: ["POST", "PUT", "PATCH"].includes(req.method)
          ? JSON.stringify(req.body)
          : undefined,
      });

      let data: any;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      return res.status(response.status).json(data);
    } catch (err: any) {
      console.error("Proxy error:", err);
      return res.status(500).json({ error: err.message });
    }
  });
});
