import { Routes, Route } from '@angular/router';
import { blogSeoResolver, blogTitleResolver } from './pages/blog/blog-route.resolver';
import { homePageTitle, pageTitle } from './utils/page-title.utils';

const HOME_TITLE = homePageTitle('Convert Photos & Screenshots to Calendar Events with AI');
const HOW_IT_WORKS_TITLE = pageTitle('How It Works: Convert Photos & Images to Calendar Events');
const PRIVACY_TITLE = pageTitle('Privacy Policy: How We Protect Your Data');
const TERMS_TITLE = pageTitle('Terms of Use: Service Terms & Conditions');
const LEGAL_MENTIONS_TITLE = pageTitle('Legal Mentions: Company & Legal Information');
const BLOG_TITLE = pageTitle('Blog: Guides & Tips for Photo to Calendar Conversion');
const SEARCH_TITLE = pageTitle('Search PhotoCalia');
const PRICING_TITLE = pageTitle('Pricing: Free, Pro & Business Plans');
const SUBSCRIPTION_SUCCESS_TITLE = pageTitle('Subscription Activated');
const DONATION_SUCCESS_TITLE = pageTitle('Thank You for Your Donation');
const ABOUT_TITLE = pageTitle('About: AI Calendar Converter Built by Idriss');
const ADD_EVENT_TO_CALENDAR_FROM_PHOTO_TITLE = pageTitle(
  'Add Events to Your Calendar from a Photo or Image',
);
const PHOTO_TO_CALENDAR_TITLE = pageTitle('Photo to Calendar Converter');
const IMAGE_TO_GOOGLE_CALENDAR_TITLE = pageTitle('Image to Google Calendar Converter');
const PDF_TO_CALENDAR_TITLE = pageTitle('PDF to Calendar Converter');
const OCR_CALENDAR_EXTRACTION_TITLE = pageTitle('OCR Calendar Extraction with AI');

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
    path: 'add-event-to-calendar-from-photo',
    loadComponent: () => import('./pages/pillar/pillar').then((m) => m.Pillar),
    title: ADD_EVENT_TO_CALENDAR_FROM_PHOTO_TITLE,
    data: {
      pillarSlug: 'add-event-to-calendar-from-photo',
      seo: {
        title: ADD_EVENT_TO_CALENDAR_FROM_PHOTO_TITLE,
        description:
          'Add events to your calendar from a photo, image, screenshot, flyer, or scanned document. PhotoCalia extracts dates, times, locations, and event details for Google Calendar, Apple Calendar, Outlook, and ICS.',
        keywords:
          'add event to calendar from photo, add events from image to calendar, add calendar event from picture, add event to your calendar from image or photo, screenshot to calendar, flyer to calendar, photo to calendar',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/add-event-to-calendar-from-photo',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Can I add event to your calendar from image or photo?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. With PhotoCalia, you can upload an image or photo containing event information, review the extracted details, and export calendar events for Google Calendar, Apple Calendar, Outlook, or any calendar app that supports ICS files.',
                },
              },
              {
                '@type': 'Question',
                name: 'What image types can become calendar events?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'PhotoCalia works with photos, screenshots, flyers, appointment cards, scanned notices, JPG, PNG, HEIC, and PDF files when they contain visible dates, times, places, or event titles.',
                },
              },
            ],
          },
        ],
      },
    },
  },
  {
    path: 'photo-to-calendar',
    loadComponent: () => import('./pages/pillar/pillar').then((m) => m.Pillar),
    title: PHOTO_TO_CALENDAR_TITLE,
    data: {
      pillarSlug: 'photo-to-calendar',
      seo: {
        title: PHOTO_TO_CALENDAR_TITLE,
        description:
          'Convert photos of flyers, appointment cards, timetables, and screenshots into calendar events with AI. Review and export ICS files for Google Calendar, Outlook, and Apple Calendar.',
        keywords:
          'photo to calendar, photo calendar converter, picture to calendar, convert flyer to calendar, appointment card to calendar',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/photo-to-calendar',
        type: 'website',
        structuredData: [],
      },
    },
  },
  {
    path: 'image-to-google-calendar',
    loadComponent: () => import('./pages/pillar/pillar').then((m) => m.Pillar),
    title: IMAGE_TO_GOOGLE_CALENDAR_TITLE,
    data: {
      pillarSlug: 'image-to-google-calendar',
      seo: {
        title: IMAGE_TO_GOOGLE_CALENDAR_TITLE,
        description:
          'Turn screenshots, scanned notices, and event images into Google Calendar events. PhotoCalia extracts dates, times, locations, and titles for review.',
        keywords:
          'image to google calendar, screenshot to google calendar, scanned schedule to calendar, add events from image',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/image-to-google-calendar',
        type: 'website',
        structuredData: [],
      },
    },
  },
  {
    path: 'pdf-to-calendar',
    loadComponent: () => import('./pages/pillar/pillar').then((m) => m.Pillar),
    title: PDF_TO_CALENDAR_TITLE,
    data: {
      pillarSlug: 'pdf-to-calendar',
      seo: {
        title: PDF_TO_CALENDAR_TITLE,
        description:
          'Upload PDFs containing schedules, agendas, exam timetables, or event programs and convert them into editable calendar events.',
        keywords:
          'PDF to calendar, PDF schedule to calendar, convert PDF agenda to ICS, exam timetable PDF to calendar',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/pdf-to-calendar',
        type: 'website',
        structuredData: [],
      },
    },
  },
  {
    path: 'ocr-calendar-extraction',
    loadComponent: () => import('./pages/pillar/pillar').then((m) => m.Pillar),
    title: OCR_CALENDAR_EXTRACTION_TITLE,
    data: {
      pillarSlug: 'ocr-calendar-extraction',
      seo: {
        title: OCR_CALENDAR_EXTRACTION_TITLE,
        description:
          'Learn how OCR and AI extract dates, times, locations, and event titles from images, then turn them into structured calendar entries.',
        keywords:
          'OCR calendar extraction, AI calendar extraction, extract events from image, OCR to ICS, event extraction AI',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/ocr-calendar-extraction',
        type: 'website',
        structuredData: [],
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
    path: 'search',
    loadComponent: () => import('./pages/search/search').then((m) => m.Search),
    title: SEARCH_TITLE,
    data: {
      seo: {
        title: SEARCH_TITLE,
        description:
          'Search PhotoCalia pages and guides about photo to calendar conversion, OCR, PDFs, Google Calendar, pricing, and planning workflows.',
        keywords:
          'photocalia search, search photo to calendar guides, search OCR calendar articles, calendar converter help',
        ogImage: 'https://www.photocalia.com/assets/images/converter.png',
        ogUrl: 'https://www.photocalia.com/search',
        type: 'website',
        structuredData: [],
      },
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
      },
    },
  },
];

export const routes: Routes = [
  // English routes (default)
  ...pageRoutes,

  // French routes under /fr prefix
  {
    path: 'fr',
    children: [...pageRoutes, { path: '**', redirectTo: '' }],
  },

  // Catch-all redirect
  { path: '**', redirectTo: '' },
];
