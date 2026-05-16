import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server routes configuration for prerendering.
 * All static pages are prerendered at build time for AI crawler accessibility.
 */
export const serverRoutes: ServerRoute[] = [
  // English pages
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'how-it-works', renderMode: RenderMode.Prerender },
  { path: 'privacy', renderMode: RenderMode.Prerender },
  { path: 'terms', renderMode: RenderMode.Prerender },
  { path: 'legal-mentions', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'blog', renderMode: RenderMode.Prerender },
  { path: 'blog/photo-to-google-calendar', renderMode: RenderMode.Prerender },
  { path: 'blog/digitize-paper-schedules', renderMode: RenderMode.Prerender },
  { path: 'blog/ai-ocr-calendar-extraction', renderMode: RenderMode.Prerender },
  { path: 'pricing', renderMode: RenderMode.Prerender },

  // French pages
  { path: 'fr', renderMode: RenderMode.Prerender },
  { path: 'fr/how-it-works', renderMode: RenderMode.Prerender },
  { path: 'fr/privacy', renderMode: RenderMode.Prerender },
  { path: 'fr/terms', renderMode: RenderMode.Prerender },
  { path: 'fr/legal-mentions', renderMode: RenderMode.Prerender },
  { path: 'fr/about', renderMode: RenderMode.Prerender },
  { path: 'fr/blog', renderMode: RenderMode.Prerender },
  { path: 'fr/blog/photo-to-google-calendar', renderMode: RenderMode.Prerender },
  { path: 'fr/blog/digitize-paper-schedules', renderMode: RenderMode.Prerender },
  { path: 'fr/blog/ai-ocr-calendar-extraction', renderMode: RenderMode.Prerender },
  { path: 'fr/pricing', renderMode: RenderMode.Prerender },

  // Catch-all: client-side rendered (not prerendered)
  { path: '**', renderMode: RenderMode.Server },
];
