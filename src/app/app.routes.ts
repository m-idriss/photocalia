import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

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
    path: '**',
    redirectTo: '',
  },
];
