import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_LEVELS = ['error', 'warn', 'info'] as const;

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { level, message, context, data } = req.body ?? {};

  if (!message || !ALLOWED_LEVELS.includes(level)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const entry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    ...(data !== undefined && { data }),
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
