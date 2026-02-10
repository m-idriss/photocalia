import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { HowItWorks } from './pages/how-it-works/how-it-works';

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
    path: '**',
    redirectTo: '',
  },
];
