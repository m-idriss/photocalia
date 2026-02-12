import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { HowItWorks } from './pages/how-it-works/how-it-works';
import { Privacy } from './pages/privacy/privacy';
import { Terms } from './pages/terms/terms';
import { LegalMentions } from './pages/legal-mentions/legal-mentions';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Calendar Converter | Photocalia',
    data: {
      seo: {
        title: 'Free AI Calendar Converter - Convert Images & PDFs to ICS Calendar Files | Photocalia',
        description: 'Free AI-powered calendar converter: Instantly transform screenshots, images, and PDF documents into ICS calendar files. Convert appointment reminders, event flyers, schedules, and meeting invitations to Google Calendar, Outlook, Apple Calendar.',
        keywords: 'calendar converter, image to calendar, PDF to calendar, ICS generator, AI calendar extraction, screenshot to calendar, appointment converter, event converter, calendar OCR',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/',
        type: 'website'
      }
    }
  },
  {
    path: 'how-it-works',
    component: HowItWorks,
    title: 'How It Works - AI Calendar Converter | Photocalia',
    data: {
      seo: {
        title: 'How It Works - Photo to Calendar, Image to ICS Converter | Photocalia',
        description: 'Learn how Photocalia converts photos, screenshots, and PDFs into calendar events using AI. Upload images of appointments, events, and schedules - our AI calendar assistant extracts dates, times, and locations automatically.',
        keywords: 'photo to calendar, image to calendar, add events from picture, AI calendar assistant, ICS import, screenshot to calendar, how to convert image to calendar, calendar event extraction',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/how-it-works',
        type: 'website'
      }
    }
  },
  {
    path: 'privacy',
    component: Privacy,
    title: 'Privacy Policy - GDPR & Data Protection | Photocalia',
    data: {
      seo: {
        title: 'Privacy Policy - How We Protect Your Data | Photocalia',
        description: 'Learn how Photocalia protects your privacy and personal data. GDPR-compliant privacy policy covering data collection, AI processing, third-party services, and your rights.',
        keywords: 'privacy policy, data protection, GDPR, personal data, privacy rights',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/privacy',
        type: 'website'
      }
    }
  },
  {
    path: 'terms',
    component: Terms,
    title: 'Terms of Use - Service Agreement | Photocalia',
    data: {
      seo: {
        title: 'Terms of Use - Service Terms & Conditions | Photocalia',
        description: 'Terms of Use for Photocalia AI calendar converter. Learn about usage limits, AI accuracy, liability, and service terms.',
        keywords: 'terms of use, terms of service, service agreement, user agreement',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/terms',
        type: 'website'
      }
    }
  },
  {
    path: 'legal-mentions',
    component: LegalMentions,
    title: 'Legal Mentions - Company & Legal Information | Photocalia',
    data: {
      seo: {
        title: 'Legal Mentions - Company Information & Legal Requirements | Photocalia',
        description: 'Legal mentions for Photocalia including company information, hosting provider, intellectual property, and GDPR compliance.',
        keywords: 'legal mentions, company information, legal notice, hosting provider',
        ogImage: 'https://photocalia.com/assets/images/converter.png',
        ogUrl: 'https://photocalia.com/legal-mentions',
        type: 'website'
      }
    }
  },
  {
    path: '**',
    redirectTo: '',
  },
];
