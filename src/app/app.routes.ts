import { Routes, Route } from '@angular/router';
import { blogSeoResolver, blogTitleResolver } from './pages/blog/blog-route.resolver';
import { homePageTitle, localizedPageTitle, pageTitle } from './utils/page-title.utils';
import { SUBSCRIPTION_PLANS } from './constants';

const FREE_PLAN = SUBSCRIPTION_PLANS.find((plan) => plan.id === 'free')!;
const PRO_PLAN = SUBSCRIPTION_PLANS.find((plan) => plan.id === 'pro')!;
const BUSINESS_PLAN = SUBSCRIPTION_PLANS.find((plan) => plan.id === 'business')!;
const PRICING_DESCRIPTION = `Choose the PhotoCalia plan that fits your needs. Start free with ${FREE_PLAN.monthlyQuota} conversions/month, upgrade to Pro for ${PRO_PLAN.monthlyQuota}/month or Business for ${BUSINESS_PLAN.monthlyQuota}/month.`;

const HOME_TITLE = homePageTitle('Photo to Calendar Converter with AI');
const HOW_IT_WORKS_TITLE = pageTitle('How It Works: Convert Photos & Images to Calendar Events');
const PRIVACY_TITLE = pageTitle('Privacy Policy: How We Protect Your Data');
const TERMS_TITLE = pageTitle('Terms of Use: Service Terms & Conditions');
const LEGAL_MENTIONS_TITLE = pageTitle('Legal Mentions: Company & Legal Information');
const BLOG_TITLE = pageTitle('Blog: Guides & Tips for Photo to Calendar Conversion');
const BLOG_TITLE_FR = 'Guides photo vers calendrier et OCR | PhotoCalia';
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
const HOME_TITLE_FR = 'PhotoCalia | Convertir une photo en événements d’agenda';
const HOW_IT_WORKS_TITLE_FR = 'Comment convertir une photo en événements | PhotoCalia';
const ADD_EVENT_TO_CALENDAR_FROM_PHOTO_TITLE_FR =
  'Ajouter un événement depuis une photo | PhotoCalia';
const PHOTO_TO_CALENDAR_TITLE_FR = 'Convertisseur photo vers calendrier | PhotoCalia';
const IMAGE_TO_GOOGLE_CALENDAR_TITLE_FR = 'Image vers Google Agenda : convertisseur | PhotoCalia';
const PDF_TO_CALENDAR_TITLE_FR = 'Convertisseur PDF vers calendrier | PhotoCalia';
const OCR_CALENDAR_EXTRACTION_TITLE_FR = 'Extraction OCR d’événements d’agenda | PhotoCalia';

/**
 * Shared page route definitions used for both English (root) and French (/fr) paths.
 * SEO data uses English as default; the SeoService dynamically updates
 * canonical/hreflang based on the actual URL.
 */
const pageRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: localizedPageTitle(HOME_TITLE, HOME_TITLE_FR),
    data: {
      seo: {
        title: HOME_TITLE,
        description:
          'Convert a photo, screenshot, flyer, or PDF into calendar events with AI. Review dates, times, and locations, then export to Google Calendar or ICS.',
        keywords:
          'photo to calendar events, image to calendar converter, picture to calendar app, convert screenshot to Google Calendar, AI calendar from photo, scan flyer to calendar, upload timetable photo, extract events from image, OCR calendar events, PDF to calendar, ICS generator, free calendar tool',
        localized: {
          fr: {
            title: HOME_TITLE_FR,
            description:
              'Transformez gratuitement une photo, une capture, un flyer ou un PDF en événements. PhotoCalia extrait dates, heures et lieux pour Google Agenda, Outlook ou Apple Calendrier.',
            keywords:
              'photo vers calendrier, image vers agenda, capture écran vers Google Agenda, convertir PDF en calendrier, OCR événements agenda',
          },
        },
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
    title: localizedPageTitle(HOW_IT_WORKS_TITLE, HOW_IT_WORKS_TITLE_FR),
    data: {
      seo: {
        title: HOW_IT_WORKS_TITLE,
        description:
          'Learn how PhotoCalia converts photos, screenshots, and PDFs into calendar events using multimodal AI. Upload an appointment, flyer, or schedule, then review the extracted dates, times, and locations.',
        keywords:
          'photo to calendar, image to calendar, add events from picture, AI calendar assistant, ICS import, screenshot to calendar, how to convert image to calendar, calendar event extraction, picture to calendar event',
        localized: {
          fr: {
            title: HOW_IT_WORKS_TITLE_FR,
            description:
              'Découvrez comment PhotoCalia transforme photos, captures et PDF en événements grâce à l’IA, puis les exporte vers Google Agenda, Outlook ou Apple Calendrier.',
            keywords:
              'comment convertir photo en calendrier, ajouter événements depuis image, capture vers agenda, export ICS',
          },
        },
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
                  text: 'PhotoCalia supports JPG, JPEG and PNG images, plus PDF documents. You can upload appointment reminders, concert tickets, school schedules, event flyers, and documents containing calendar information.',
                },
              },
              {
                '@type': 'Question',
                name: 'How accurate is the AI at reading calendar information from images?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'PhotoCalia uses multimodal AI to propose dates, times, locations, and event titles from clear images. Accuracy depends on the source, so you can review and edit every detail before saving.',
                },
              },
              {
                '@type': 'Question',
                name: 'Do I need an account to convert images to calendar files?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: `You sign in with your existing Google account — no separate registration or form to fill out. Your Google account gives you ${FREE_PLAN.monthlyQuota} free conversions per month immediately.`,
                },
              },
              {
                '@type': 'Question',
                name: 'Is my image data kept private?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Uploaded files are processed over HTTPS and are not intentionally stored by PhotoCalia after the request completes. Account, quota, payment and limited operational records have separate retention rules described in the privacy policy.',
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
    title: localizedPageTitle(
      ADD_EVENT_TO_CALENDAR_FROM_PHOTO_TITLE,
      ADD_EVENT_TO_CALENDAR_FROM_PHOTO_TITLE_FR,
    ),
    data: {
      pillarSlug: 'add-event-to-calendar-from-photo',
      seo: {
        title: ADD_EVENT_TO_CALENDAR_FROM_PHOTO_TITLE,
        description:
          'Add events to your calendar from a photo, image, screenshot, flyer, or scanned document. PhotoCalia extracts dates, times, locations, and event details for Google Calendar, Apple Calendar, Outlook, and ICS.',
        keywords:
          'add event to calendar from photo, add events from image to calendar, add calendar event from picture, add event to your calendar from image or photo, screenshot to calendar, flyer to calendar, photo to calendar',
        localized: {
          fr: {
            title: ADD_EVENT_TO_CALENDAR_FROM_PHOTO_TITLE_FR,
            description:
              'Ajoutez des événements à votre agenda depuis une photo, une image, une capture ou un flyer. Vérifiez les dates et horaires avant l’export vers votre calendrier.',
            keywords:
              'ajouter événement calendrier depuis photo, image vers agenda, capture écran vers calendrier, flyer vers agenda',
          },
        },
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
                  text: 'PhotoCalia works with photos, screenshots, flyers, appointment cards, scanned notices, JPG, JPEG, PNG and PDF files when they contain visible dates, times, places or event titles.',
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
    title: localizedPageTitle(PHOTO_TO_CALENDAR_TITLE, PHOTO_TO_CALENDAR_TITLE_FR),
    data: {
      pillarSlug: 'photo-to-calendar',
      seo: {
        title: PHOTO_TO_CALENDAR_TITLE,
        description:
          'Convert photos of flyers, appointment cards, timetables, and screenshots into calendar events with AI. Review and export ICS files for Google Calendar, Outlook, and Apple Calendar.',
        keywords:
          'photo to calendar, photo calendar converter, picture to calendar, convert flyer to calendar, appointment card to calendar',
        localized: {
          fr: {
            title: PHOTO_TO_CALENDAR_TITLE_FR,
            description:
              'Convertissez photos de flyers, rendez-vous, plannings et captures en événements modifiables, puis exportez-les vers Google Agenda, Outlook ou Apple Calendrier.',
            keywords:
              'convertisseur photo vers calendrier, photo vers agenda, image vers calendrier, flyer vers agenda',
          },
        },
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
    title: localizedPageTitle(IMAGE_TO_GOOGLE_CALENDAR_TITLE, IMAGE_TO_GOOGLE_CALENDAR_TITLE_FR),
    data: {
      pillarSlug: 'image-to-google-calendar',
      seo: {
        title: IMAGE_TO_GOOGLE_CALENDAR_TITLE,
        description:
          'Turn screenshots, scanned notices, and event images into Google Calendar events. PhotoCalia extracts dates, times, locations, and titles for review.',
        keywords:
          'image to google calendar, screenshot to google calendar, scanned schedule to calendar, add events from image',
        localized: {
          fr: {
            title: IMAGE_TO_GOOGLE_CALENDAR_TITLE_FR,
            description:
              'Transformez une image, une capture ou un document scanné en événements Google Agenda. Vérifiez dates, horaires, lieux et titres avant l’import.',
            keywords:
              'image vers Google Agenda, capture écran vers Google Agenda, photo vers agenda Google, planning scanné calendrier',
          },
        },
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
    title: localizedPageTitle(PDF_TO_CALENDAR_TITLE, PDF_TO_CALENDAR_TITLE_FR),
    data: {
      pillarSlug: 'pdf-to-calendar',
      seo: {
        title: PDF_TO_CALENDAR_TITLE,
        description:
          'Upload PDFs containing schedules, agendas, exam timetables, or event programs and convert them into editable calendar events.',
        keywords:
          'PDF to calendar, PDF schedule to calendar, convert PDF agenda to ICS, exam timetable PDF to calendar',
        localized: {
          fr: {
            title: PDF_TO_CALENDAR_TITLE_FR,
            description:
              'Convertissez un PDF de planning, programme, agenda ou examens en événements modifiables pour Google Agenda, Outlook et Apple Calendrier.',
            keywords:
              'PDF vers calendrier, convertir planning PDF en agenda, PDF vers ICS, emploi du temps PDF vers calendrier',
          },
        },
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
    title: localizedPageTitle(OCR_CALENDAR_EXTRACTION_TITLE, OCR_CALENDAR_EXTRACTION_TITLE_FR),
    data: {
      pillarSlug: 'ocr-calendar-extraction',
      seo: {
        title: OCR_CALENDAR_EXTRACTION_TITLE,
        description:
          'Learn how OCR and AI extract dates, times, locations, and event titles from images, then turn them into structured calendar entries.',
        keywords:
          'OCR calendar extraction, AI calendar extraction, extract events from image, OCR to ICS, event extraction AI',
        localized: {
          fr: {
            title: OCR_CALENDAR_EXTRACTION_TITLE_FR,
            description:
              'Découvrez comment l’OCR et l’IA extraient dates, heures, lieux et titres depuis une image pour créer automatiquement des événements de calendrier.',
            keywords:
              'OCR calendrier, extraction événements image, OCR vers ICS, extraction agenda par IA',
          },
        },
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
    title: localizedPageTitle(BLOG_TITLE, BLOG_TITLE_FR),
    data: {
      seo: {
        title: BLOG_TITLE,
        description:
          'Guides, tutorials, and tips on converting photos to calendar events with AI. Learn about OCR technology, digitizing schedules, and productivity hacks.',
        keywords:
          'photo to calendar guide, AI calendar tips, digitize schedule, OCR calendar, image to ICS tutorial',
        localized: {
          fr: {
            title: BLOG_TITLE_FR,
            description:
              'Guides pratiques pour convertir photos, captures, plannings et PDF en événements de calendrier grâce à l’IA et à l’OCR.',
            keywords:
              'guide photo vers calendrier, OCR agenda, convertir planning en calendrier, image vers ICS, Google Agenda',
          },
        },
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
        robots: 'noindex, follow',
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
        description: PRICING_DESCRIPTION,
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
                  description: `${FREE_PLAN.monthlyQuota} conversions per month, no credit card required.`,
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
                  description: `${PRO_PLAN.monthlyQuota} conversions per month.`,
                  offers: {
                    '@type': 'Offer',
                    price: String(PRO_PLAN.monthlyPrice),
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
                  description: `${BUSINESS_PLAN.monthlyQuota} conversions per month.`,
                  offers: {
                    '@type': 'Offer',
                    price: String(BUSINESS_PLAN.monthlyPrice),
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
          'Learn about PhotoCalia, the AI-powered photo to calendar converter. Built by Idriss with Angular, Firebase Authentication, Vercel, and a Quarkus API.',
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
