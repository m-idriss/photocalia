import { RenderMode, ServerRoute } from '@angular/ssr';
import { BLOG_SLUGS } from './pages/blog/blog.models';

/**
 * Server routes configuration for prerendering.
 * All static pages are prerendered at build time for AI crawler accessibility.
 */
export const serverRoutes: ServerRoute[] = [
  // English pages
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'how-it-works', renderMode: RenderMode.Prerender },
  { path: 'add-event-to-calendar-from-photo', renderMode: RenderMode.Prerender },
  { path: 'photo-to-calendar', renderMode: RenderMode.Prerender },
  { path: 'image-to-google-calendar', renderMode: RenderMode.Prerender },
  { path: 'pdf-to-calendar', renderMode: RenderMode.Prerender },
  { path: 'ocr-calendar-extraction', renderMode: RenderMode.Prerender },
  { path: 'privacy', renderMode: RenderMode.Prerender },
  { path: 'terms', renderMode: RenderMode.Prerender },
  { path: 'legal-mentions', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'blog', renderMode: RenderMode.Prerender },
  { path: 'search', renderMode: RenderMode.Prerender },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => BLOG_SLUGS.map((slug) => ({ slug })),
  },
  { path: 'pricing', renderMode: RenderMode.Prerender },
  { path: 'subscription/success', renderMode: RenderMode.Prerender },
  { path: 'donation/success', renderMode: RenderMode.Prerender },

  // French pages
  { path: 'fr', renderMode: RenderMode.Prerender },
  { path: 'fr/how-it-works', renderMode: RenderMode.Prerender },
  { path: 'fr/add-event-to-calendar-from-photo', renderMode: RenderMode.Prerender },
  { path: 'fr/photo-to-calendar', renderMode: RenderMode.Prerender },
  { path: 'fr/image-to-google-calendar', renderMode: RenderMode.Prerender },
  { path: 'fr/pdf-to-calendar', renderMode: RenderMode.Prerender },
  { path: 'fr/ocr-calendar-extraction', renderMode: RenderMode.Prerender },
  { path: 'fr/privacy', renderMode: RenderMode.Prerender },
  { path: 'fr/terms', renderMode: RenderMode.Prerender },
  { path: 'fr/legal-mentions', renderMode: RenderMode.Prerender },
  { path: 'fr/about', renderMode: RenderMode.Prerender },
  { path: 'fr/blog', renderMode: RenderMode.Prerender },
  { path: 'fr/search', renderMode: RenderMode.Prerender },
  {
    path: 'fr/blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => BLOG_SLUGS.map((slug) => ({ slug })),
  },
  { path: 'fr/pricing', renderMode: RenderMode.Prerender },
  { path: 'fr/subscription/success', renderMode: RenderMode.Prerender },
  { path: 'fr/donation/success', renderMode: RenderMode.Prerender },

  // Catch-all: client-side rendered (not prerendered)
  { path: '**', renderMode: RenderMode.Server },
];
