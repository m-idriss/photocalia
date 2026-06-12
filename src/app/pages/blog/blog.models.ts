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
  imageAlt: string;
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
    image: '/assets/images/blog/photo-to-google-calendar.jpg',
    imageAlt: 'A phone photo of an event flyer being converted into calendar events on a laptop',
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
    image: '/assets/images/blog/digitize-paper-schedules.jpg',
    imageAlt:
      'Paper appointment cards and printed schedules being organized into a digital calendar',
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
    image: '/assets/images/blog/reddit-photo-to-calendar.jpg',
    imageAlt: 'A community discussion about adding event photos to a calendar without typing',
    translationKey: 'blog.redditPhotoCalendar',
  },
  {
    slug: 'summer-exam-scheduling',
    title: 'Summer Exam Scheduling: How to Organize Multiple Test Dates in Minutes',
    description:
      'Manage summer exams, retakes, and entrance tests across multiple subjects. Learn how to digitize exam timetables and track preparation deadlines effortlessly.',
    author: 'Idriss',
    authorUrl: 'https://3dime.com',
    datePublished: '2026-06-12',
    dateModified: '2026-06-12',
    readingTime: '6 min',
    tags: ['exam', 'scheduling', 'students', 'summer'],
    image: '/assets/images/blog/summer-exam-scheduling.jpg',
    imageAlt:
      'An exam timetable photo being converted into a color-coded calendar with preparation reminders',
    translationKey: 'blog.summerExamScheduling',
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
    image: '/assets/images/blog/ai-ocr-calendar-extraction.jpg',
    imageAlt: 'An AI OCR workflow extracting event flyer details into structured calendar cards',
    translationKey: 'blog.aiOcrCalendar',
  },
  {
    slug: 'sports-league-training',
    title: 'Track Your Team: Convert Sports Schedules into a Coaching & Playing Calendar',
    description:
      'Soccer league schedules, tennis tournaments, marathon training plans—snap photos of your sports schedule and build a master calendar with all games, practices, and training milestones.',
    author: 'Idriss',
    authorUrl: 'https://3dime.com',
    datePublished: '2026-06-21',
    dateModified: '2026-06-21',
    readingTime: '6 min',
    tags: ['sports', 'fitness', 'training', 'scheduling'],
    image: '/assets/images/blog/sports-league-training.jpg',
    imageAlt: "Sports league schedules and training plans organized in an athlete's calendar",
    translationKey: 'blog.sportsLeagueTraining',
  },
];
