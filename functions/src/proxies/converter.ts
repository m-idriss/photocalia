import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import { GoogleAuth } from "google-auth-library";
import { getTrackingService } from "../services/tracking";
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
    if (!origin) return callback(null, true); // allow non-browser clients like curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});

/**
 * Helper function to get OAuth 2.0 access token using service account
 */
async function getGeminiAccessToken(): Promise<string> {
  const serviceAccountJson = process.env.SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error("SERVICE_ACCOUNT_JSON not configured");
  }

  let credentials;
  try {
    credentials = JSON.parse(serviceAccountJson);
  } catch (parseError) {
    throw new Error("Invalid SERVICE_ACCOUNT_JSON format");
  }

  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/generative-language'],
  });

  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();

  if (!accessTokenResponse.token) {
    throw new Error("Failed to obtain access token");
  }

  return accessTokenResponse.token;
}

/**
 * Image file interface for type safety
 */
interface ImageFile {
  dataUrl?: string;
  url?: string;
}

/**
 * Helper function to convert image data URL to inline data format for Gemini
 */
function prepareImageForGemini(file: ImageFile) {
  const dataUrl = file.dataUrl || file.url;

  if (!dataUrl) {
    throw new Error("Image file must have either dataUrl or url property");
  }

  // Extract mime type and base64 data from data URL
  // Format: data:image/jpeg;base64,/9j/4AAQ...
  const matches = dataUrl.match(/^data:(.+?);base64,(.+)$/);

  if (!matches) {
    throw new Error("Invalid image data URL format");
  }

  const [, mimeType, data] = matches;

  return {
    inlineData: {
      mimeType,
      data
    }
  };
}

export const converterFunction = onRequest(
  {
    secrets: ["SERVICE_ACCOUNT_JSON", "NOTION_TOKEN"],
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  (req, res) => {
    return corsHandler(req, res, async () => {
      const startTime = Date.now();
      const trackingService = getTrackingService();
      const quotaService = getQuotaService();
      const modelName = process.env.MODEL_NAME || "gemini-2.5-flash-lite";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

      // Extract domain from request origin for tracking
      const originHeader = req.headers.origin || req.headers.referer;
      let domain: string;

      if (originHeader) {
        try {
          const url = new URL(originHeader);
          const hostname = url.hostname;
          if (
            hostname === "localhost" ||
            hostname.startsWith("127.") ||
            hostname.startsWith("10.") ||
            hostname.startsWith("192.168.") ||
            /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname)
          ) {
            domain = "local";
          } else if (hostname === "3dime.com" || hostname === "www.3dime.com") {
            domain = "production";
          } else {
            domain = hostname;
          }
        } catch {
          domain = "invalid-url";
        }
      } else {
        domain = "unknown";
      }

      try {
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Use POST." });
        }

        const { files, timeZone, currentDate, userId } = req.body;
        if (!files?.length) {
          return res.status(400).json({ error: "No files provided" });
        }

        // Use provided userId or generate anonymous one
        const anonymousUserId = userId || "anonymous";
        const fileCount = files.length;

        // Check quota before processing
        const quotaCheck = await quotaService.checkQuota(anonymousUserId);
        if (!quotaCheck.allowed) {
          // Log quota exceeded event
          trackingService.logQuotaExceeded(
            anonymousUserId,
            quotaCheck.limit - quotaCheck.remaining,
            quotaCheck.limit,
            quotaCheck.plan,
            domain
          ).catch((err) => console.error("Tracking error:", err));

          return res.status(429).json({
            error: "You've reached your monthly conversion limit. Please try again next month or contact us to upgrade your plan.",
            message: "Monthly limit reached",
            details: {
              monthlyLimit: quotaCheck.limit,
              used: quotaCheck.limit - quotaCheck.remaining,
              resetsAt: "start of next month"
            },
            contact: "contact@3dime.com"
          });
        }

        const tz = timeZone || "UTC";
        const today = currentDate || new Date().toISOString().split("T")[0];

        // Build base system and user messages
        let baseMessage = process.env.BASE_TEXT_MESSAGE || "";
        baseMessage = baseMessage.replace("${today}", today).replace("${tz}", tz);

        const systemPrompt = process.env.PROMPT || "";

        // Get OAuth 2.0 access token
        let accessToken: string;
        try {
          accessToken = await getGeminiAccessToken();
        } catch (authError: any) {
          console.error("Authentication error:", authError);
          return res.status(500).json({
            error: "Failed to authenticate with Gemini API",
            message: authError.message
          });
        }

        // Prepare content parts: system prompt + text + images
        const imageParts = [];
        const imageErrors = [];

        for (let i = 0; i < files.length; i++) {
          try {
            imageParts.push(prepareImageForGemini(files[i]));
          } catch (error: any) {
            console.error(`Error preparing image ${i}:`, error);
            imageErrors.push(`Image ${i + 1}: ${error.message}`);
          }
        }

        if (imageParts.length === 0) {
          return res.status(400).json({
            error: "Failed to process any images",
            details: imageErrors
          });
        }

        const contentParts = [
          {
            text: `${systemPrompt}\n\n${baseMessage}`
          },
          ...imageParts
        ];

        // Call Gemini API
        const response = await fetch(apiUrl,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: contentParts
                }
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 8192,
              }
            })
          }
        );

        if (!response.ok) {
          let errorData: any;
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: await response.text() };
          }
          console.error("Gemini API error:", errorData);

          // Handle specific error codes
          if (response.status === 401) {
            return res.status(401).json({
              error: "Authentication failed with Gemini API",
              details: errorData,
            });
          } else if (response.status === 403) {
            return res.status(403).json({
              error: "Permission denied for Gemini API",
              details: errorData,
            });
          }

          return res.status(response.status).json({
            error: "Failed to process images with Gemini API",
            details: errorData,
          });
        }

        const responseData = await response.json();
        let icsContent = responseData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!icsContent) {
          return res.status(500).json({
            error: "No ICS generated",
            details: responseData
          });
        }

        if (icsContent.toLowerCase() === "null") {
          const duration = Date.now() - startTime;
          // Track as error (no events found)
          trackingService.logConversionError(
            anonymousUserId,
            fileCount,
            "No events found in images",
            0, // eventCount
            duration,
            domain
          ).catch((err) => console.error("Tracking error:", err));

          return res.status(200).json({
            success: false,
            error: "No events found in images",
            message: "AI determined there are no calendar events to extract.",
          });
        }

        // Remove potential markdown fences (```ics ... ``` or just ```)
        icsContent = icsContent.replace(/```(?:ics)?\s*[\r\n]|```/gi, "").trim();

        if (!isValidIcs(icsContent)) {
          const duration = Date.now() - startTime;
          const eventCount = countEvents(icsContent); // Count events even if invalid
          // Track failed conversion (invalid ICS)
          trackingService.logConversionError(
            anonymousUserId,
            fileCount,
            "Generated ICS is invalid",
            eventCount,
            duration,
            domain
          ).catch((err) => console.error("Tracking error:", err));

          return res.status(200).json({
            success: false,
            error: "Generated ICS is invalid",
            icsContent,
          });
        }

        const duration = Date.now() - startTime;
        const eventCount = countEvents(icsContent);

        // Increment quota usage for successful conversion
        quotaService.incrementUsage(anonymousUserId)
          .catch((err) => console.error("Quota increment error:", err));

        // Track successful conversion
        trackingService.logConversion(anonymousUserId, fileCount, domain, eventCount, duration)
          .catch((err) => console.error("Tracking error:", err));

        return res.status(200).json({ success: true, icsContent });
      } catch (err: any) {
        console.error("Converter error:", err);
        const duration = Date.now() - startTime;

        // Track error
        trackingService.logConversionError(
          req.body.userId || "anonymous",
          req.body.files?.length || 0,
          err.message || "Internal error",
          0, // eventCount unknown in error case
          duration,
          domain
        ).catch((trackErr) => console.error("Tracking error:", trackErr));

        return res.status(500).json({ error: "Internal error", message: err.message });
      }
    });
  }
);

// ⚡ Improved ICS validation: check VERSION and at least one VEVENT
function isValidIcs(ics: string): boolean {
  return (
    ics.startsWith("BEGIN:VCALENDAR") &&
    ics.includes("VERSION:2.0") &&
    ics.includes("BEGIN:VEVENT") &&
    ics.endsWith("END:VCALENDAR")
  );
}

/**
 * Count the number of calendar events (VEVENT blocks) in ICS content
 */
function countEvents(ics: string): number {
  const matches = ics.match(/BEGIN:VEVENT/g);
  return matches ? matches.length : 0;
}
