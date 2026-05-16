/**
 * Blog article metadata used for listing, SEO, and Article schema.
 */
export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  author: string;
  authorUrl: string;
  datePublished: string;
  dateModified: string;
  readingTime: string;
  tags: string[];
  image: string;
  /** Translation key prefix for article content, e.g. 'blog.photo-to-calendar' */
  translationKey: string;
}

/**
 * Central registry of all blog articles.
 * Add new articles here — routing and listing are auto-generated.
 */
export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'photo-to-google-calendar',
    title: 'How to Convert a Photo to Google Calendar Events in 30 Seconds',
    description:
      'Learn how to turn any photo, screenshot, or flyer into Google Calendar events using AI. Step-by-step guide with tips for best results.',
    author: 'Idriss',
    authorUrl: 'https://3dime.com',
    datePublished: '2026-03-18',
    dateModified: '2026-03-18',
    readingTime: '5 min',
    tags: ['tutorial', 'google-calendar', 'photo-to-calendar'],
    image: 'https://photocalia.com/assets/images/converter.png',
    translationKey: 'blog.photoToCalendar',
  },
  {
    slug: 'digitize-paper-schedules',
    title: 'Best Ways to Digitize Paper Schedules and Appointment Cards',
    description:
      'Stop losing paper appointment cards and schedules. Discover how AI-powered tools can digitize them into calendar events automatically.',
    author: 'Idriss',
    authorUrl: 'https://3dime.com',
    datePublished: '2026-03-25',
    dateModified: '2026-03-25',
    readingTime: '6 min',
    tags: ['guide', 'digitize', 'paper-schedules'],
    image: 'https://photocalia.com/assets/images/converter.png',
    translationKey: 'blog.digitizeSchedules',
  },
  {
    slug: 'reddit-photo-to-calendar',
    title: "Reddit's Favorite Way to Add Event Photos to Google Calendar (No Typing)",
    description:
      "Every week someone asks on r/productivity: 'Is there an app that reads a photo and adds events to my calendar?' Here's the answer the community landed on.",
    author: 'Idriss',
    authorUrl: 'https://3dime.com',
    datePublished: '2026-05-16',
    dateModified: '2026-05-16',
    readingTime: '5 min',
    tags: ['reddit', 'productivity', 'google-calendar', 'photo-to-calendar'],
    image: 'https://photocalia.com/assets/images/converter.png',
    translationKey: 'blog.redditPhotoCalendar',
  },
  {
    slug: 'ai-ocr-calendar-extraction',
    title: 'How AI OCR Transforms Event Flyers into Calendar Entries',
    description:
      'Understand how AI and OCR technology work together to extract event details from images and create structured calendar data.',
    author: 'Idriss',
    authorUrl: 'https://3dime.com',
    datePublished: '2026-04-01',
    dateModified: '2026-04-01',
    readingTime: '7 min',
    tags: ['technology', 'ai', 'ocr'],
    image: 'https://photocalia.com/assets/images/converter.png',
    translationKey: 'blog.aiOcrCalendar',
  },
];
