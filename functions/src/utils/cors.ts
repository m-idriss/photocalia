import cors from "cors";

/**
 * Allowed origins for CORS
 * Includes production domains, localhost for development, and Vercel preview deployments
 */
const allowedOrigins = [
  'https://photocalia.com',
  'https://www.photocalia.com',
  'http://localhost:4200',
  'http://localhost:5000'
];

/**
 * Check if origin is a Vercel preview deployment
 * Matches patterns like: https://photocalia-*.vercel.app
 * Uses restrictive pattern to match only valid Vercel URL naming (alphanumeric and hyphens)
 * Ensures hyphens only appear between alphanumeric characters
 */
function isVercelPreview(origin: string): boolean {
  const vercelPattern = /^https:\/\/photocalia-[a-z0-9]+(?:-[a-z0-9]+)*\.vercel\.app$/;
  return vercelPattern.test(origin);
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string): boolean {
  return allowedOrigins.includes(origin) || isVercelPreview(origin);
}

/**
 * Shared CORS handler for all Firebase functions
 */
export const corsHandler = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
});
