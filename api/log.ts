import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_LEVELS = ['error', 'warn', 'info'] as const;
const ALLOWED_ORIGINS = new Set(['https://photocalia.com', 'https://www.photocalia.com']);
const MAX_MESSAGE_LENGTH = 500;
const MAX_CONTEXT_LENGTH = 100;
const MAX_DATA_LENGTH = 4000;

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const origin = req.headers.origin;
  if (typeof origin !== 'string' || !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  const { level, message, context, data } = req.body ?? {};

  if (
    typeof message !== 'string' ||
    message.length === 0 ||
    message.length > MAX_MESSAGE_LENGTH ||
    (context !== undefined &&
      (typeof context !== 'string' || context.length > MAX_CONTEXT_LENGTH)) ||
    !ALLOWED_LEVELS.includes(level)
  ) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  let safeData: string | undefined;
  if (data !== undefined) {
    try {
      safeData = JSON.stringify(data).slice(0, MAX_DATA_LENGTH);
    } catch {
      safeData = '[unserializable]';
    }
  }

  const entry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    ...(safeData !== undefined && { data: safeData }),
  };

  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }

  return res.status(204).end();
}
