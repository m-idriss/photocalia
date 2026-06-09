import { Routes, Route } from '@angular/router';

/**
 * Shared page route definitions used for both English (root) and French (/fr) paths.
 * SEO data uses English as default; the SeoService dynamically updates
 * canonical/hreflang based on the actual URL.
 */
const pageRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'PhotoCalia – Convert Photos & Screenshots to Calendar Events with AI',
    data: {
      seo: {
        title: 'PhotoCalia – Convert Photos & Screenshots to Calendar Events with AI',
        description:
          'Turn any photo, screenshot, flyer or PDF into calendar events with AI — no manual typing. PhotoCalia extracts dates, times & locations automatically and adds them to Google Calendar or exports ICS files. Free, no separate signup.',
        keywords:
          'photo to calendar events, image to calendar converter, picture to calendar app, convert screenshot to Google Calendar, AI calendar from photo, scan flyer to calendar, upload timetable photo, extract events from image, OCR calendar events, PDF to calendar, ICS generator, free calendar tool',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/',
        type: 'website',
        structuredData: [],
      },
    },
  },
  {
    path: 'how-it-works',
    loadComponent: () => import('./pages/how-it-works/how-it-works').then((m) => m.HowItWorks),
    title: 'How It Works - AI Calendar Converter | PhotoCalia',
    data: {
      seo: {
        title: 'How It Works - Convert Photos & Images to Calendar Events | PhotoCalia',
        description:
          'Learn how PhotoCalia converts photos, screenshots, and PDFs into calendar events using AI. Upload any image of an appointment, event flyer, or schedule — GPT-4 Vision extracts the dates, times, and locations automatically.',
        keywords:
          'photo to calendar, image to calendar, add events from picture, AI calendar assistant, ICS import, screenshot to calendar, how to convert image to calendar, calendar event extraction, picture to calendar event',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/how-it-works',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://photocalia.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'How It Works',
                item: 'https://photocalia.com/how-it-works',
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
    title: 'Privacy Policy - GDPR & Data Protection | PhotoCalia',
    data: {
      seo: {
        title: 'Privacy Policy - How We Protect Your Data | PhotoCalia',
        description:
          'Learn how PhotoCalia protects your privacy and personal data. GDPR-compliant privacy policy covering data collection, AI processing, third-party services, and your rights.',
        keywords: 'privacy policy, data protection, GDPR, personal data, privacy rights',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/privacy',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://photocalia.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Privacy Policy',
                item: 'https://photocalia.com/privacy',
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
    title: 'Terms of Use - Service Agreement | PhotoCalia',
    data: {
      seo: {
        title: 'Terms of Use - Service Terms & Conditions | PhotoCalia',
        description:
          'Terms of Use for PhotoCalia AI calendar converter. Learn about usage limits, AI accuracy, liability, and service terms.',
        keywords: 'terms of use, terms of service, service agreement, user agreement',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/terms',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://photocalia.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Terms of Use',
                item: 'https://photocalia.com/terms',
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
    title: 'Legal Mentions - Company & Legal Information | PhotoCalia',
    data: {
      seo: {
        title: 'Legal Mentions - Company Information & Legal Requirements | PhotoCalia',
        description:
          'Legal mentions for PhotoCalia including company information, hosting provider, intellectual property, and GDPR compliance.',
        keywords: 'legal mentions, company information, legal notice, hosting provider',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/legal-mentions',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://photocalia.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Legal Mentions',
                item: 'https://photocalia.com/legal-mentions',
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
    title: 'Blog - Guides & Tips for Photo to Calendar Conversion | PhotoCalia',
    data: {
      seo: {
        title: 'Blog - Guides & Tips for Photo to Calendar Conversion | PhotoCalia',
        description:
          'Guides, tutorials, and tips on converting photos to calendar events with AI. Learn about OCR technology, digitizing schedules, and productivity hacks.',
        keywords:
          'photo to calendar guide, AI calendar tips, digitize schedule, OCR calendar, image to ICS tutorial',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/blog',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://photocalia.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://photocalia.com/blog',
              },
            ],
          },
        ],
      },
    },
  },
  {
    path: 'blog/photo-to-google-calendar',
    loadComponent: () => import('./pages/blog/article/article').then((m) => m.Article),
    title: 'How to Convert a Photo to Google Calendar Events in 30 Seconds | PhotoCalia',
    data: {
      seo: {
        title: 'How to Convert a Photo to Google Calendar Events in 30 Seconds | PhotoCalia',
        description:
          'Learn how to turn any photo, screenshot, or flyer into Google Calendar events using AI. Step-by-step guide with tips for best results.',
        keywords:
          'photo to google calendar, convert image to calendar event, picture to calendar, screenshot to google calendar',
        ogImage: 'https://photocalia.com/assets/images/blog/photo-to-google-calendar.jpg',
        ogUrl: 'https://photocalia.com/blog/photo-to-google-calendar',
        type: 'article',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://photocalia.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://photocalia.com/blog',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Photo to Google Calendar',
                item: 'https://photocalia.com/blog/photo-to-google-calendar',
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'How to Convert a Photo to Google Calendar Events in 30 Seconds',
            author: { '@type': 'Person', name: 'Idriss', url: 'https://3dime.com' },
            datePublished: '2026-03-18',
            dateModified: '2026-03-18',
            publisher: {
              '@type': 'Organization',
              name: 'PhotoCalia',
              url: 'https://photocalia.com',
            },
            image: 'https://photocalia.com/assets/images/blog/photo-to-google-calendar.jpg',
            mainEntityOfPage: 'https://photocalia.com/blog/photo-to-google-calendar',
          },
        ],
      },
    },
  },
  {
    path: 'blog/digitize-paper-schedules',
    loadComponent: () => import('./pages/blog/article/article').then((m) => m.Article),
    title: 'Best Ways to Digitize Paper Schedules and Appointment Cards | PhotoCalia',
    data: {
      seo: {
        title: 'Best Ways to Digitize Paper Schedules and Appointment Cards | PhotoCalia',
        description:
          'Stop losing paper appointment cards and schedules. Discover how AI-powered tools can digitize them into calendar events automatically.',
        keywords:
          'digitize paper schedule, scan appointment card to calendar, paper to digital calendar, AI schedule digitizer',
        ogImage: 'https://photocalia.com/assets/images/blog/digitize-paper-schedules.jpg',
        ogUrl: 'https://photocalia.com/blog/digitize-paper-schedules',
        type: 'article',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://photocalia.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://photocalia.com/blog',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Digitize Paper Schedules',
                item: 'https://photocalia.com/blog/digitize-paper-schedules',
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Best Ways to Digitize Paper Schedules and Appointment Cards',
            author: { '@type': 'Person', name: 'Idriss', url: 'https://3dime.com' },
            datePublished: '2026-03-25',
            dateModified: '2026-03-25',
            publisher: {
              '@type': 'Organization',
              name: 'PhotoCalia',
              url: 'https://photocalia.com',
            },
            image: 'https://photocalia.com/assets/images/blog/digitize-paper-schedules.jpg',
            mainEntityOfPage: 'https://photocalia.com/blog/digitize-paper-schedules',
          },
        ],
      },
    },
  },
  {
    path: 'blog/ai-ocr-calendar-extraction',
    loadComponent: () => import('./pages/blog/article/article').then((m) => m.Article),
    title: 'How AI OCR Transforms Event Flyers into Calendar Entries | PhotoCalia',
    data: {
      seo: {
        title: 'How AI OCR Transforms Event Flyers into Calendar Entries | PhotoCalia',
        description:
          'Understand how AI and OCR technology work together to extract event details from images and create structured calendar data.',
        keywords:
          'AI OCR calendar, event extraction from image, flyer to calendar AI, optical character recognition calendar',
        ogImage: 'https://photocalia.com/assets/images/blog/ai-ocr-calendar-extraction.jpg',
        ogUrl: 'https://photocalia.com/blog/ai-ocr-calendar-extraction',
        type: 'article',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://photocalia.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://photocalia.com/blog',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'AI OCR Calendar Extraction',
                item: 'https://photocalia.com/blog/ai-ocr-calendar-extraction',
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'How AI OCR Transforms Event Flyers into Calendar Entries',
            author: { '@type': 'Person', name: 'Idriss', url: 'https://3dime.com' },
            datePublished: '2026-04-01',
            dateModified: '2026-04-01',
            publisher: {
              '@type': 'Organization',
              name: 'PhotoCalia',
              url: 'https://photocalia.com',
            },
            image: 'https://photocalia.com/assets/images/blog/ai-ocr-calendar-extraction.jpg',
            mainEntityOfPage: 'https://photocalia.com/blog/ai-ocr-calendar-extraction',
          },
        ],
      },
    },
  },
  {
    path: 'blog/reddit-photo-to-calendar',
    loadComponent: () => import('./pages/blog/article/article').then((m) => m.Article),
    title: "Reddit's Favorite Way to Add Event Photos to Google Calendar | PhotoCalia",
    data: {
      seo: {
        title: "Reddit's Favorite Way to Add Event Photos to Google Calendar | PhotoCalia",
        description:
          "Every week someone asks on r/productivity: 'Is there an app that reads a photo and adds events to my calendar?' Here's the answer the community landed on.",
        keywords:
          'reddit productivity calendar, photo to google calendar reddit, r/productivity calendar app, add events from photo reddit, no typing calendar events',
        ogImage: 'https://photocalia.com/assets/images/blog/reddit-photo-to-calendar.jpg',
        ogUrl: 'https://photocalia.com/blog/reddit-photo-to-calendar',
        type: 'article',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://photocalia.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://photocalia.com/blog',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: "Reddit's Favorite Way to Add Event Photos to Google Calendar",
                item: 'https://photocalia.com/blog/reddit-photo-to-calendar',
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: "Reddit's Favorite Way to Add Event Photos to Google Calendar (No Typing)",
            author: { '@type': 'Person', name: 'Idriss', url: 'https://3dime.com' },
            datePublished: '2026-05-16',
            dateModified: '2026-05-16',
            publisher: {
              '@type': 'Organization',
              name: 'PhotoCalia',
              url: 'https://photocalia.com',
            },
            image: 'https://photocalia.com/assets/images/blog/reddit-photo-to-calendar.jpg',
            mainEntityOfPage: 'https://photocalia.com/blog/reddit-photo-to-calendar',
          },
        ],
      },
    },
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing').then((m) => m.Pricing),
    title: 'Pricing — PhotoCalia',
    data: {
      seo: {
        title: 'Pricing — Free, Pro & Business Plans | PhotoCalia',
        description:
          'Choose the PhotoCalia plan that fits your needs. Start free with 3 conversions/month, upgrade to Pro for 50/month or Business for 120/month.',
        keywords:
          'photocalia pricing, calendar converter plans, photo to calendar subscription, upgrade plan',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/pricing',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://photocalia.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Pricing',
                item: 'https://photocalia.com/pricing',
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
                    url: 'https://photocalia.com/pricing',
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
                    url: 'https://photocalia.com/pricing',
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
                    url: 'https://photocalia.com/pricing',
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
    title: 'Subscription Activated — PhotoCalia',
    data: {
      seo: {
        title: 'Subscription Activated — PhotoCalia',
        description:
          'Your PhotoCalia subscription is now active. Start converting images to calendar events.',
        keywords: '',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/subscription/success',
        type: 'website',
        structuredData: [],
      },
    },
  },
  {
    path: 'donation/success',
    loadComponent: () =>
      import('./pages/donation-success/donation-success').then((m) => m.DonationSuccess),
    title: 'Thank You for Your Donation — PhotoCalia',
    data: {
      seo: {
        title: 'Thank You for Your Donation — PhotoCalia',
        description:
          'Thank you for supporting PhotoCalia! Your donation helps us improve the service.',
        keywords: '',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/donation/success',
        type: 'website',
        structuredData: [],
      },
    },
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
    title: 'About PhotoCalia - AI Calendar Converter by Idriss',
    data: {
      seo: {
        title: 'About PhotoCalia - AI Calendar Converter Built by Idriss | PhotoCalia',
        description:
          'Learn about PhotoCalia, the AI-powered photo to calendar converter. Built by Idriss using Angular, Firebase, and GPT-4 Vision. Open source, privacy-focused, and free to use.',
        keywords:
          'about photocalia, AI calendar converter, photo to calendar app, Idriss, 3dime, open source calendar tool',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/about',
        type: 'website',
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://photocalia.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'About',
                item: 'https://photocalia.com/about',
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
