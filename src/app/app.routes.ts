import { Routes, Route } from '@angular/router';
import { blogSeoResolver, blogTitleResolver } from './pages/blog/blog-route.resolver';
import { homePageTitle, pageTitle } from './utils/page-title.utils';

const HOME_TITLE = homePageTitle('Convert Photos & Screenshots to Calendar Events with AI');
const HOW_IT_WORKS_TITLE = pageTitle('How It Works: Convert Photos & Images to Calendar Events');
const PRIVACY_TITLE = pageTitle('Privacy Policy: How We Protect Your Data');
const TERMS_TITLE = pageTitle('Terms of Use: Service Terms & Conditions');
const LEGAL_MENTIONS_TITLE = pageTitle('Legal Mentions: Company & Legal Information');
const BLOG_TITLE = pageTitle('Blog: Guides & Tips for Photo to Calendar Conversion');
const PRICING_TITLE = pageTitle('Pricing: Free, Pro & Business Plans');
const SUBSCRIPTION_SUCCESS_TITLE = pageTitle('Subscription Activated');
const DONATION_SUCCESS_TITLE = pageTitle('Thank You for Your Donation');
const ABOUT_TITLE = pageTitle('About: AI Calendar Converter Built by Idriss');
const FR_ABOUT_TITLE = pageTitle('À propos : convertisseur calendrier IA créé par Idriss');

/**
 * Shared page route definitions used for both English (root) and French (/fr) paths.
 * SEO data uses English as default; the SeoService dynamically updates
 * canonical/hreflang based on the actual URL.
 */
const pageRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: HOME_TITLE,
    data: {
      seo: {
        title: HOME_TITLE,
        description:
          'Turn any photo, screenshot, flyer or PDF into calendar events with AI — no manual typing. PhotoCalia extracts dates, times & locations automatically and adds them to Google Calendar or exports ICS files. Free, no separate signup.',
        keywords:
          'photo to calendar events, image to calendar converter, picture to calendar app, convert screenshot to Google Calendar, AI calendar from photo, scan flyer to calendar, upload timetable photo, extract events from image, OCR calendar events, PDF to calendar, ICS generator, free calendar tool',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/',
        type: 'website',
        structuredData: [],
      },
    },
  },
  {
    path: 'how-it-works',
    loadComponent: () => import('./pages/how-it-works/how-it-works').then((m) => m.HowItWorks),
    title: HOW_IT_WORKS_TITLE,
    data: {
      seo: {
        title: HOW_IT_WORKS_TITLE,
        description:
          'Learn how PhotoCalia converts photos, screenshots, and PDFs into calendar events using AI. Upload any image of an appointment, event flyer, or schedule — GPT-4 Vision extracts the dates, times, and locations automatically.',
        keywords:
          'photo to calendar, image to calendar, add events from picture, AI calendar assistant, ICS import, screenshot to calendar, how to convert image to calendar, calendar event extraction, picture to calendar event',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/how-it-works',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.photocalia.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'How It Works',
                item: 'https://www.photocalia.com/how-it-works',
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What image formats are supported by PhotoCalia?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'PhotoCalia supports JPG, JPEG, PNG, HEIC image formats and PDF documents. You can upload appointment reminders, concert tickets, school schedules, event flyers, and any document containing calendar information.',
                },
              },
              {
                '@type': 'Question',
                name: 'How accurate is the AI at reading calendar information from images?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'PhotoCalia uses GPT-4 Vision, one of the most accurate AI models for image understanding. It reliably extracts dates, times, locations, and event titles from clear images. You can always review and edit any extracted detail before saving to your calendar.',
                },
              },
              {
                '@type': 'Question',
                name: 'Do I need an account to convert images to calendar files?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'You sign in with your existing Google account — no separate registration or form to fill out. Your Google account gives you 3 free conversions per month immediately.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is my image data kept private?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Your files are processed securely and are not stored permanently on PhotoCalia servers. The AI conversion happens in real-time, and your images are handled according to strict privacy protocols.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I edit events after the AI extracts them?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. After extraction, you can review every event detail — title, date, time, location, and description — and make any corrections before downloading the ICS file.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is an ICS file and how do I use it?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'An ICS (iCalendar) file is the universal calendar format supported by Google Calendar, Microsoft Outlook, Apple Calendar, Yahoo Calendar, and virtually every calendar application. After downloading your ICS file from PhotoCalia, simply open it or import it into your preferred calendar app to add all events at once.',
                },
              },
            ],
          },
        ],
      },
    },
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
    title: PRIVACY_TITLE,
    data: {
      seo: {
        title: PRIVACY_TITLE,
        description:
          'Learn how PhotoCalia protects your privacy and personal data. GDPR-compliant privacy policy covering data collection, AI processing, third-party services, and your rights.',
        keywords: 'privacy policy, data protection, GDPR, personal data, privacy rights',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/privacy',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.photocalia.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Privacy Policy',
                item: 'https://www.photocalia.com/privacy',
              },
            ],
          },
        ],
      },
    },
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/terms/terms').then((m) => m.Terms),
    title: TERMS_TITLE,
    data: {
      seo: {
        title: TERMS_TITLE,
        description:
          'Terms of Use for PhotoCalia AI calendar converter. Learn about usage limits, AI accuracy, liability, and service terms.',
        keywords: 'terms of use, terms of service, service agreement, user agreement',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/terms',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.photocalia.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Terms of Use',
                item: 'https://www.photocalia.com/terms',
              },
            ],
          },
        ],
      },
    },
  },
  {
    path: 'legal-mentions',
    loadComponent: () =>
      import('./pages/legal-mentions/legal-mentions').then((m) => m.LegalMentions),
    title: LEGAL_MENTIONS_TITLE,
    data: {
      seo: {
        title: LEGAL_MENTIONS_TITLE,
        description:
          'Legal mentions for PhotoCalia including company information, hosting provider, intellectual property, and GDPR compliance.',
        keywords: 'legal mentions, company information, legal notice, hosting provider',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/legal-mentions',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.photocalia.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Legal Mentions',
                item: 'https://www.photocalia.com/legal-mentions',
              },
            ],
          },
        ],
      },
    },
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog').then((m) => m.Blog),
    title: BLOG_TITLE,
    data: {
      seo: {
        title: BLOG_TITLE,
        description:
          'Guides, tutorials, and tips on converting photos to calendar events with AI. Learn about OCR technology, digitizing schedules, and productivity hacks.',
        keywords:
          'photo to calendar guide, AI calendar tips, digitize schedule, OCR calendar, image to ICS tutorial',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/blog',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.photocalia.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://www.photocalia.com/blog',
              },
            ],
          },
        ],
      },
    },
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog/article/article').then((m) => m.Article),
    title: blogTitleResolver,
    resolve: {
      seo: blogSeoResolver,
    },
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing').then((m) => m.Pricing),
    title: PRICING_TITLE,
    data: {
      seo: {
        title: PRICING_TITLE,
        description:
          'Choose the PhotoCalia plan that fits your needs. Start free with 3 conversions/month, upgrade to Pro for 50/month or Business for 120/month.',
        keywords:
          'photocalia pricing, calendar converter plans, photo to calendar subscription, upgrade plan',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/pricing',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.photocalia.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Pricing',
                item: 'https://www.photocalia.com/pricing',
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'PhotoCalia Plans',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                item: {
                  '@type': 'Product',
                  name: 'Free Plan',
                  description: '3 conversions per month, no credit card required.',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'EUR',
                    availability: 'https://schema.org/InStock',
                    url: 'https://www.photocalia.com/pricing',
                  },
                },
              },
              {
                '@type': 'ListItem',
                position: 2,
                item: {
                  '@type': 'Product',
                  name: 'Pro Plan',
                  description: '50 conversions per month.',
                  offers: {
                    '@type': 'Offer',
                    price: '4.99',
                    priceCurrency: 'EUR',
                    availability: 'https://schema.org/InStock',
                    url: 'https://www.photocalia.com/pricing',
                  },
                },
              },
              {
                '@type': 'ListItem',
                position: 3,
                item: {
                  '@type': 'Product',
                  name: 'Business Plan',
                  description: '120 conversions per month.',
                  offers: {
                    '@type': 'Offer',
                    price: '9.99',
                    priceCurrency: 'EUR',
                    availability: 'https://schema.org/InStock',
                    url: 'https://www.photocalia.com/pricing',
                  },
                },
              },
            ],
          },
        ],
      },
    },
  },
  {
    path: 'subscription/success',
    loadComponent: () =>
      import('./pages/subscription-success/subscription-success').then(
        (m) => m.SubscriptionSuccess,
      ),
    title: SUBSCRIPTION_SUCCESS_TITLE,
    data: {
      seo: {
        title: SUBSCRIPTION_SUCCESS_TITLE,
        description:
          'Your PhotoCalia subscription is now active. Start converting images to calendar events.',
        robots: 'noindex, nofollow',
        keywords: '',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/subscription/success',
        type: 'website',
        structuredData: [],
      },
    },
  },
  {
    path: 'donation/success',
    loadComponent: () =>
      import('./pages/donation-success/donation-success').then((m) => m.DonationSuccess),
    title: DONATION_SUCCESS_TITLE,
    data: {
      seo: {
        title: DONATION_SUCCESS_TITLE,
        description:
          'Thank you for supporting PhotoCalia! Your donation helps us improve the service.',
        robots: 'noindex, nofollow',
        keywords: '',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/donation/success',
        type: 'website',
        structuredData: [],
      },
    },
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
    title: ABOUT_TITLE,
    data: {
      seo: {
        title: ABOUT_TITLE,
        description:
          'Learn about PhotoCalia, the AI-powered photo to calendar converter. Built by Idriss using Angular, Firebase, and GPT-4 Vision. Open source, privacy-focused, and free to use.',
        keywords:
          'about photocalia, AI calendar converter, photo to calendar app, Idriss, 3dime, open source calendar tool',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/about',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.photocalia.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'About',
                item: 'https://www.photocalia.com/about',
              },
            ],
          },
        ],
        localized: {
          fr: {
            title: pageTitle('À propos : convertisseur calendrier IA créé par Idriss'),
            description:
              "Découvrez PhotoCalia, le convertisseur photo vers calendrier propulsé par l'IA. Créé par Idriss avec Angular, Firebase et GPT-4 Vision. Open source, respectueux de la confidentialité et gratuit.",
            keywords:
              'à propos photocalia, convertisseur calendrier IA, application photo vers calendrier, Idriss, 3dime, outil calendrier open source',
            ogImage: 'https://www.photocalia.com/assets/images/converter.png',
            ogUrl: 'https://www.photocalia.com/fr/about',
            type: 'website',
            structuredData: [
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Accueil',
                    item: 'https://www.photocalia.com/fr',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'À propos',
                    item: 'https://www.photocalia.com/fr/about',
                  },
                ],
              },
            ],
          },
        },
      },
    },
  },
];

const frenchPageRoutes: Route[] = pageRoutes.map((route) =>
  route.path === 'about' ? { ...route, title: FR_ABOUT_TITLE } : route,
);

export const routes: Routes = [
  // English routes (default)
  ...pageRoutes,

  // French routes under /fr prefix
  {
    path: 'fr',
    children: [...frenchPageRoutes, { path: '**', redirectTo: '' }],
  },

  // Catch-all redirect
  { path: '**', redirectTo: '' },
];
