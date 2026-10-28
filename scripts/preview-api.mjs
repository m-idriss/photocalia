// In-memory display fixtures for the local preview. No conversion or payment provider is called.
import { createServer } from 'node:http';

const routes = new Map([
  [
    '/v1/converter/plans',
    [
      { plan: 'FREE', limit: 3 },
      { plan: 'PLUS', limit: 15 },
    ],
  ],
  [
    '/v1/converter/quota-status',
    {
      success: true,
      enabled: true,
      quota: { usageCount: 0, limit: 3, remaining: 3, plan: 'FREE', paidCredits: 0 },
    },
  ],
  ['/v1/converter/statistics', { fileCount: 0, eventCount: 0 }],
  ['/v1/subscriptions/status', { planId: 'free', status: 'free' }],
]);
createServer((request, response) => {
  const path = new URL(request.url, 'http://127.0.0.1:9098').pathname;
  // Discard request bodies; uploaded documents are never saved or processed.
  request.resume();
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-store');
  if (request.method === 'GET' && routes.has(path)) {
    response.end(JSON.stringify(routes.get(path)));
    return;
  }
  response.statusCode = 503;
  response.end(
    JSON.stringify({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'Local preview: AI conversion and payments are disabled.',
    }),
  );
}).listen(9098, '127.0.0.1', () =>
  console.log('Local preview fixtures listening on 127.0.0.1:9098.'),
);
