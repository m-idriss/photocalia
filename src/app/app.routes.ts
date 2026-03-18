import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Photocalia – Convert Photos, Screenshots & Flyers to Calendar Events with AI',
    data: {
      seo: {
        title: 'Photocalia – Convert Photos, Screenshots & Flyers to Calendar Events with AI',
        description:
          'Turn any photo, screenshot, flyer or PDF into calendar events with AI — no manual typing. Photocalia extracts dates, times & locations automatically and adds them to Google Calendar or exports ICS files. Free, no separate signup.',
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
    title: 'How It Works - AI Calendar Converter | Photocalia',
    data: {
      seo: {
        title: 'How It Works - Convert Photos & Images to Calendar Events | Photocalia',
        description:
          'Learn how Photocalia converts photos, screenshots, and PDFs into calendar events using AI. Upload any image of an appointment, event flyer, or schedule — GPT-4 Vision extracts the dates, times, and locations automatically.',
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
                name: 'What image formats are supported by Photocalia?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Photocalia supports JPG, JPEG, PNG, HEIC image formats and PDF documents. You can upload appointment reminders, concert tickets, school schedules, event flyers, and any document containing calendar information.',
                },
              },
              {
                '@type': 'Question',
                name: 'How accurate is the AI at reading calendar information from images?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Photocalia uses GPT-4 Vision, one of the most accurate AI models for image understanding. It reliably extracts dates, times, locations, and event titles from clear images. You can always review and edit any extracted detail before saving to your calendar.',
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
                  text: 'Yes. Your files are processed securely and are not stored permanently on Photocalia servers. The AI conversion happens in real-time, and your images are handled according to strict privacy protocols.',
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
                  text: 'An ICS (iCalendar) file is the universal calendar format supported by Google Calendar, Microsoft Outlook, Apple Calendar, Yahoo Calendar, and virtually every calendar application. After downloading your ICS file from Photocalia, simply open it or import it into your preferred calendar app to add all events at once.',
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
    title: 'Privacy Policy - GDPR & Data Protection | Photocalia',
    data: {
      seo: {
        title: 'Privacy Policy - How We Protect Your Data | Photocalia',
        description:
          'Learn how Photocalia protects your privacy and personal data. GDPR-compliant privacy policy covering data collection, AI processing, third-party services, and your rights.',
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
    title: 'Terms of Use - Service Agreement | Photocalia',
    data: {
      seo: {
        title: 'Terms of Use - Service Terms & Conditions | Photocalia',
        description:
          'Terms of Use for Photocalia AI calendar converter. Learn about usage limits, AI accuracy, liability, and service terms.',
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
    title: 'Legal Mentions - Company & Legal Information | Photocalia',
    data: {
      seo: {
        title: 'Legal Mentions - Company Information & Legal Requirements | Photocalia',
        description:
          'Legal mentions for Photocalia including company information, hosting provider, intellectual property, and GDPR compliance.',
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
    path: '**',
    redirectTo: '',
  },
];
