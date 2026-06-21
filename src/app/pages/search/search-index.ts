import type { SupportedLanguage } from '../../services/language.service';
import { BLOG_ARTICLES } from '../blog/blog.models';

export type SearchResultType = 'page' | 'guide';

export interface LocalizedSearchEntry {
  title: string;
  description: string;
  content: string;
}

export interface SearchEntry {
  id: string;
  type: SearchResultType;
  route: string;
  image: string;
  tags: readonly string[];
  locales: Record<SupportedLanguage, LocalizedSearchEntry>;
}

const STATIC_SEARCH_ENTRIES: SearchEntry[] = [
  {
    id: 'home',
    type: 'page',
    route: '/',
    image: '/assets/images/home/zen-lemur-phone.png',
    tags: ['converter', 'ai', 'calendar', 'photo', 'pdf', 'ics'],
    locales: {
      en: {
        title: 'PhotoCalia',
        description: 'Convert photos, screenshots, flyers, and PDFs into calendar events with AI.',
        content:
          'Upload an image or PDF, extract dates times locations and event titles, then export an ICS file for Google Calendar Outlook or Apple Calendar.',
      },
      fr: {
        title: 'PhotoCalia',
        description:
          'Convertissez photos, captures, flyers et PDF en événements de calendrier avec IA.',
        content:
          'Importez une image ou un PDF, extrayez dates heures lieux et titres, puis exportez un fichier ICS pour Google Agenda Outlook ou Apple Calendrier.',
      },
    },
  },
  {
    id: 'how-it-works',
    type: 'page',
    route: '/how-it-works',
    image: '/assets/images/converter.png',
    tags: ['workflow', 'ocr', 'ai', 'ics', 'calendar'],
    locales: {
      en: {
        title: 'How It Works',
        description: 'Learn how PhotoCalia turns images and PDFs into calendar-ready events.',
        content:
          'Upload a document, AI detects event details, review the generated calendar entries, then download or import the ICS file.',
      },
      fr: {
        title: 'Comment ça marche',
        description:
          'Découvrez comment PhotoCalia transforme images et PDF en événements prêts pour votre calendrier.',
        content:
          "Importez un document, l'IA détecte les détails, vérifiez les événements générés, puis téléchargez ou importez le fichier ICS.",
      },
    },
  },
  {
    id: 'photo-to-calendar',
    type: 'page',
    route: '/photo-to-calendar',
    image: '/assets/images/blog/photo-to-google-calendar.jpg',
    tags: ['photo', 'calendar', 'converter', 'flyer', 'appointment'],
    locales: {
      en: {
        title: 'Photo to Calendar Converter',
        description:
          'Turn photos of flyers, appointment cards, timetables, and screenshots into events.',
        content:
          'PhotoCalia extracts dates times locations and titles from photos so you can review and export calendar events without retyping.',
      },
      fr: {
        title: 'Convertisseur Photo vers Calendrier',
        description:
          'Transformez photos de flyers, fiches de rendez-vous, emplois du temps et captures en événements.',
        content:
          'PhotoCalia extrait dates heures lieux et titres depuis vos photos pour vérifier et exporter sans ressaisie.',
      },
    },
  },
  {
    id: 'image-to-google-calendar',
    type: 'page',
    route: '/image-to-google-calendar',
    image: '/assets/images/converter.png',
    tags: ['image', 'google-calendar', 'screenshot', 'calendar'],
    locales: {
      en: {
        title: 'Image to Google Calendar',
        description:
          'Convert screenshots, photos, and scanned notices into Google Calendar events.',
        content:
          'Use PhotoCalia when event details are trapped inside an image and need to become a clean Google Calendar event.',
      },
      fr: {
        title: 'Image vers Google Agenda',
        description:
          'Convertissez captures, photos et documents scannés en événements Google Agenda.',
        content:
          "Utilisez PhotoCalia quand les détails d'un événement sont bloqués dans une image et doivent devenir un événement Google Agenda.",
      },
    },
  },
  {
    id: 'pdf-to-calendar',
    type: 'page',
    route: '/pdf-to-calendar',
    image: '/assets/images/blog/digitize-paper-schedules.jpg',
    tags: ['pdf', 'calendar', 'schedule', 'agenda', 'exam'],
    locales: {
      en: {
        title: 'PDF to Calendar',
        description:
          'Upload PDFs containing schedules, agendas, exam timetables, or event programs.',
        content:
          'Convert PDF schedules and agendas into editable calendar events, then export to ICS for major calendar apps.',
      },
      fr: {
        title: 'PDF vers Calendrier',
        description:
          "Importez des PDF contenant plannings, agendas, calendriers d'examens ou programmes.",
        content:
          'Convertissez plannings et agendas PDF en événements modifiables, puis exportez en ICS.',
      },
    },
  },
  {
    id: 'ocr-calendar-extraction',
    type: 'page',
    route: '/ocr-calendar-extraction',
    image: '/assets/images/blog/ai-ocr-calendar-extraction.jpg',
    tags: ['ocr', 'ai', 'extraction', 'calendar'],
    locales: {
      en: {
        title: 'OCR Calendar Extraction',
        description: 'Understand how OCR and AI extract structured calendar details from images.',
        content:
          'Recognize dates times places and event titles inside images, then turn them into structured calendar entries.',
      },
      fr: {
        title: 'Extraction OCR de Calendrier',
        description:
          "Comprenez comment l'OCR et l'IA extraient des détails de calendrier structurés depuis les images.",
        content:
          'Reconnaître dates heures lieux et titres dans les images, puis les transformer en événements structurés.',
      },
    },
  },
  {
    id: 'blog',
    type: 'page',
    route: '/blog',
    image: '/assets/images/blog/lemur-crowd-background.webp',
    tags: ['blog', 'guides', 'tutorials', 'tips'],
    locales: {
      en: {
        title: 'Blog',
        description: 'Guides, tutorials, and tips for converting photos to calendar events.',
        content:
          'Browse PhotoCalia articles about OCR, Google Calendar, paper schedules, festivals, healthcare appointments, family planning, and productivity.',
      },
      fr: {
        title: 'Blog',
        description:
          'Guides, tutoriels et astuces pour convertir vos photos en événements de calendrier.',
        content:
          'Parcourez les articles PhotoCalia sur OCR, Google Agenda, plannings papier, festivals, rendez-vous médicaux, organisation familiale et productivité.',
      },
    },
  },
  {
    id: 'pricing',
    type: 'page',
    route: '/pricing',
    image: '/assets/images/mascot-photo.png',
    tags: ['pricing', 'plans', 'subscription', 'free', 'pro', 'business'],
    locales: {
      en: {
        title: 'Pricing',
        description: 'Choose the PhotoCalia plan that fits your conversion needs.',
        content:
          'Start free with monthly conversions, then upgrade to Pro or Business for higher photo to calendar conversion limits.',
      },
      fr: {
        title: 'Tarifs',
        description: 'Choisissez la formule PhotoCalia adaptée à vos besoins de conversion.',
        content:
          'Commencez gratuitement puis passez en Pro ou Business pour plus de conversions photo vers calendrier.',
      },
    },
  },
  {
    id: 'about',
    type: 'page',
    route: '/about',
    image: '/assets/images/about-mascot-planning.png',
    tags: ['about', 'open-source', 'privacy', 'support'],
    locales: {
      en: {
        title: 'About PhotoCalia',
        description: 'Learn about the AI calendar converter built by Idriss.',
        content:
          'PhotoCalia is an open source privacy focused project for converting images and PDFs into calendar events.',
      },
      fr: {
        title: 'À propos de PhotoCalia',
        description: 'Découvrez le convertisseur calendrier IA créé par Idriss.',
        content:
          'PhotoCalia est un projet open source axé sur la confidentialité pour convertir images et PDF en événements.',
      },
    },
  },
];

const BLOG_SEARCH_ENTRIES: SearchEntry[] = BLOG_ARTICLES.map((article) => ({
  id: `blog-${article.slug}`,
  type: 'guide',
  route: `/blog/${article.slug}`,
  image: article.image,
  tags: article.tags,
  locales: {
    en: {
      title: article.locales.en.title,
      description: article.locales.en.description,
      content: `${article.keywords} ${stripHtml(article.locales.en.contentHtml)}`,
    },
    fr: {
      title: article.locales.fr.title,
      description: article.locales.fr.description,
      content: `${article.keywords} ${stripHtml(article.locales.fr.contentHtml)}`,
    },
  },
}));

export const SEARCH_ENTRIES: readonly SearchEntry[] = [
  ...STATIC_SEARCH_ENTRIES,
  ...BLOG_SEARCH_ENTRIES,
];

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
