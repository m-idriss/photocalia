import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { LanguageService } from '../../services/language.service';
import type { SupportedLanguage } from '../../services/language.service';

interface PillarLink {
  label: string;
  url: string;
}

interface PillarSection {
  title: string;
  body: string;
  links?: PillarLink[];
}

interface PillarContent {
  title: string;
  intro: string;
  primaryCta: string;
  secondaryCta: string;
  secondaryUrl: string;
  sections: PillarSection[];
}

type PillarSlug =
  | 'add-event-to-calendar-from-photo'
  | 'photo-to-calendar'
  | 'image-to-google-calendar'
  | 'pdf-to-calendar'
  | 'ocr-calendar-extraction';

const PILLAR_CONTENT: Record<PillarSlug, Record<SupportedLanguage, PillarContent>> = {
  'add-event-to-calendar-from-photo': {
    en: {
      title: 'Add events to your calendar from a photo or image',
      intro:
        'Upload a photo, screenshot, flyer, or scanned image and let PhotoCalia turn the dates, times, places, and event details into calendar entries you can review before export.',
      primaryCta: 'Add events from a photo',
      secondaryCta: 'Read the photo to calendar guide',
      secondaryUrl: '/blog/photo-to-google-calendar',
      sections: [
        {
          title: 'Built for the exact search',
          body: 'If you are looking for how to add event to your calendar from image or photo, PhotoCalia handles the missing step between a visual document and a structured calendar event.',
          links: [
            { label: 'Photo to calendar converter', url: '/photo-to-calendar' },
            { label: 'Image to Google Calendar', url: '/image-to-google-calendar' },
          ],
        },
        {
          title: 'Works with real-world event images',
          body: 'Use it for appointment cards, class schedules, event posters, WhatsApp screenshots, conference agendas, sports timetables, and any image that contains calendar-worthy information.',
          links: [
            { label: 'Paper schedule examples', url: '/blog/digitize-paper-schedules' },
            { label: 'Healthcare appointment examples', url: '/blog/healthcare-appointments' },
          ],
        },
        {
          title: 'Export to the calendar you already use',
          body: 'After AI extraction, review each event and export an ICS calendar file compatible with Google Calendar, Apple Calendar, Outlook, and most calendar apps.',
          links: [
            { label: 'How PhotoCalia works', url: '/how-it-works' },
            { label: 'PDF to calendar converter', url: '/pdf-to-calendar' },
          ],
        },
      ],
    },
    fr: {
      title: 'Ajouter des événements à votre agenda depuis une photo ou une image',
      intro:
        'Importez une photo, une capture, un flyer ou une image scannée, puis laissez PhotoCalia transformer les dates, heures, lieux et détails en événements à vérifier avant export.',
      primaryCta: 'Ajouter depuis une photo',
      secondaryCta: 'Lire le guide photo vers calendrier',
      secondaryUrl: '/blog/photo-to-google-calendar',
      sections: [
        {
          title: 'Conçu pour cette intention',
          body: "Si vous cherchez comment ajouter un événement à votre calendrier depuis une image ou une photo, PhotoCalia fait le lien entre le document visuel et l'événement structuré.",
          links: [
            { label: 'Convertisseur photo vers calendrier', url: '/photo-to-calendar' },
            { label: 'Image vers Google Agenda', url: '/image-to-google-calendar' },
          ],
        },
        {
          title: "Compatible avec les images d'événements du quotidien",
          body: "Utilisez-le pour des fiches de rendez-vous, emplois du temps, affiches, captures WhatsApp, programmes de conférence, plannings sportifs et toute image contenant une information d'agenda.",
          links: [
            { label: 'Exemples de plannings papier', url: '/blog/digitize-paper-schedules' },
            { label: 'Exemples de rendez-vous médicaux', url: '/blog/healthcare-appointments' },
          ],
        },
        {
          title: "Export vers l'agenda que vous utilisez déjà",
          body: "Après extraction IA, vérifiez chaque événement puis exportez un fichier ICS compatible avec Google Agenda, Apple Calendrier, Outlook et la plupart des apps d'agenda.",
          links: [
            { label: 'Comment fonctionne PhotoCalia', url: '/how-it-works' },
            { label: 'Convertisseur PDF vers calendrier', url: '/pdf-to-calendar' },
          ],
        },
      ],
    },
  },
  'photo-to-calendar': {
    en: {
      title: 'Photo to calendar converter',
      intro:
        'Turn photos of flyers, appointment cards, timetables, and screenshots into calendar-ready events with AI. PhotoCalia extracts dates, times, locations, and titles so you can review and export them without retyping.',
      primaryCta: 'Convert a photo now',
      secondaryCta: 'Read the step-by-step guide',
      secondaryUrl: '/blog/photo-to-google-calendar',
      sections: [
        {
          title: 'What you can convert',
          body: 'PhotoCalia works with event flyers, appointment reminders, school notices, sports schedules, conference agendas, travel plans, and other images that contain date or time information.',
          links: [
            { label: 'Healthcare appointment examples', url: '/blog/healthcare-appointments' },
            { label: 'Paper schedule tips', url: '/blog/digitize-paper-schedules' },
            { label: 'Image to Google Calendar', url: '/image-to-google-calendar' },
          ],
        },
        {
          title: 'How the workflow works',
          body: 'Upload an image, let AI detect the event details, review the generated entries, then download an ICS file or add the events to your calendar workflow.',
          links: [
            { label: 'How PhotoCalia works', url: '/how-it-works' },
            { label: 'Photo to Google Calendar tutorial', url: '/blog/photo-to-google-calendar' },
          ],
        },
        {
          title: 'Best for everyday capture',
          body: 'The page is designed for quick capture when you receive a card, flyer, or screenshot and want the event saved before it disappears into a chat, inbox, or paper pile.',
        },
      ],
    },
    fr: {
      title: 'Convertisseur photo vers calendrier',
      intro:
        'Transformez les photos de flyers, fiches de rendez-vous, emplois du temps et captures en événements prêts pour votre calendrier. PhotoCalia extrait dates, heures, lieux et titres pour les vérifier puis les exporter sans ressaisie.',
      primaryCta: 'Convertir une photo',
      secondaryCta: 'Lire le guide pas à pas',
      secondaryUrl: '/blog/photo-to-google-calendar',
      sections: [
        {
          title: 'Ce que vous pouvez convertir',
          body: "PhotoCalia fonctionne avec les flyers d'événements, rappels de rendez-vous, documents scolaires, plannings sportifs, programmes de conférence, trajets et autres images contenant une date ou une heure.",
          links: [
            { label: 'Exemples de rendez-vous médicaux', url: '/blog/healthcare-appointments' },
            { label: 'Conseils pour plannings papier', url: '/blog/digitize-paper-schedules' },
            { label: 'Image vers Google Agenda', url: '/image-to-google-calendar' },
          ],
        },
        {
          title: 'Comment fonctionne le flux',
          body: "Importez une image, laissez l'IA détecter les détails, vérifiez les événements générés, puis téléchargez un fichier ICS ou ajoutez-les à votre calendrier.",
          links: [
            { label: 'Comment fonctionne PhotoCalia', url: '/how-it-works' },
            { label: 'Tutoriel photo vers Google Agenda', url: '/blog/photo-to-google-calendar' },
          ],
        },
        {
          title: 'Idéal pour capturer au quotidien',
          body: "Cette page cible les moments où vous recevez une carte, un flyer ou une capture et voulez sauvegarder l'événement avant qu'il ne se perde dans une conversation, une boîte mail ou une pile de papiers.",
        },
      ],
    },
  },
  'image-to-google-calendar': {
    en: {
      title: 'Image to Google Calendar',
      intro:
        'Convert screenshots, photos, and scanned notices into Google Calendar events. PhotoCalia prepares structured event data you can review before importing.',
      primaryCta: 'Try image conversion',
      secondaryCta: 'Open Google Calendar guide',
      secondaryUrl: '/blog/photo-to-google-calendar',
      sections: [
        {
          title: 'Designed for Google Calendar users',
          body: 'Use PhotoCalia when event details are trapped inside an image but you want a clean event title, date, time, location, and notes in your calendar.',
          links: [{ label: 'Google Calendar tutorial', url: '/blog/photo-to-google-calendar' }],
        },
        {
          title: 'Works beyond screenshots',
          body: 'The same flow handles photos of printed schedules, event posters, activity sheets, and PDFs when they contain calendar-worthy information.',
          links: [
            { label: 'Paper schedules', url: '/blog/digitize-paper-schedules' },
            { label: 'PDF to calendar', url: '/pdf-to-calendar' },
          ],
        },
        {
          title: 'Review before export',
          body: 'AI extraction is fast, but you stay in control. Edit titles, times, and locations before saving the final calendar file.',
        },
      ],
    },
    fr: {
      title: 'Image vers Google Agenda',
      intro:
        'Convertissez captures, photos et documents scannes en événements Google Agenda. PhotoCalia prépare des données structurées que vous pouvez vérifier avant import.',
      primaryCta: "Essayer la conversion d'image",
      secondaryCta: 'Ouvrir le guide Google Agenda',
      secondaryUrl: '/blog/photo-to-google-calendar',
      sections: [
        {
          title: 'Pensé pour Google Agenda',
          body: "Utilisez PhotoCalia quand les détails d'un événement sont bloqués dans une image mais doivent devenir un titre, une date, une heure, un lieu et des notes propres dans votre agenda.",
          links: [{ label: 'Tutoriel Google Agenda', url: '/blog/photo-to-google-calendar' }],
        },
        {
          title: 'Au-delà des captures',
          body: "Le même flux gère les photos de plannings imprimés, affiches, fiches d'activités et PDF lorsqu'ils contiennent des informations de calendrier.",
          links: [
            { label: 'Plannings papier', url: '/blog/digitize-paper-schedules' },
            { label: 'PDF vers calendrier', url: '/pdf-to-calendar' },
          ],
        },
        {
          title: "Vérifiez avant l'export",
          body: "L'extraction IA est rapide, mais vous gardez le contrôle. Modifiez titres, horaires et lieux avant d'enregistrer le fichier calendrier final.",
        },
      ],
    },
  },
  'pdf-to-calendar': {
    en: {
      title: 'PDF to calendar',
      intro:
        'Upload PDFs that contain schedules, agendas, exam timetables, or event programs and turn them into editable calendar events.',
      primaryCta: 'Convert a PDF',
      secondaryCta: 'See supported formats',
      secondaryUrl: '/how-it-works',
      sections: [
        {
          title: 'Useful for multi-page schedules',
          body: 'PDFs often contain conference agendas, school calendars, exam sessions, and activity programs. PhotoCalia extracts the events so you can review them in one workflow.',
          links: [
            { label: 'Exam timetable example', url: '/blog/summer-exam-scheduling' },
            { label: 'Sports schedule example', url: '/blog/sports-league-training' },
          ],
        },
        {
          title: 'Export to universal ICS',
          body: 'After review, export events in the ICS format supported by Google Calendar, Outlook, Apple Calendar, and most calendar apps.',
          links: [{ label: 'How PhotoCalia works', url: '/how-it-works' }],
        },
        {
          title: 'Keep source documents simple',
          body: 'For best results, upload clear PDFs with visible dates, times, section headings, and locations. Split very large documents when a single page contains one schedule.',
        },
      ],
    },
    fr: {
      title: 'PDF vers calendrier',
      intro:
        "Importez des PDF contenant plannings, agendas, calendriers d'examens ou programmes et transformez-les en événements modifiables.",
      primaryCta: 'Convertir un PDF',
      secondaryCta: 'Voir les formats acceptés',
      secondaryUrl: '/how-it-works',
      sections: [
        {
          title: 'Utile pour les plannings multi-pages',
          body: "Les PDF contiennent souvent programmes de conférence, calendriers scolaires, sessions d'examen et activités. PhotoCalia extrait les événements pour les vérifier dans un seul flux.",
          links: [
            { label: "Exemple de planning d'examens", url: '/blog/summer-exam-scheduling' },
            { label: 'Exemple de planning sportif', url: '/blog/sports-league-training' },
          ],
        },
        {
          title: 'Export universel en ICS',
          body: "Après vérification, exportez les événements au format ICS compatible avec Google Agenda, Outlook, Apple Calendrier et la plupart des apps d'agenda.",
          links: [{ label: 'Comment fonctionne PhotoCalia', url: '/how-it-works' }],
        },
        {
          title: 'Gardez des documents lisibles',
          body: 'Pour de meilleurs résultats, importez des PDF clairs avec dates, horaires, titres de sections et lieux visibles. Divisez les documents très longs quand une page contient un planning autonome.',
        },
      ],
    },
  },
  'ocr-calendar-extraction': {
    en: {
      title: 'OCR calendar extraction',
      intro:
        'PhotoCalia combines OCR and AI understanding to recognize dates, times, places, and event titles inside images, then turns them into structured calendar entries.',
      primaryCta: 'Try AI extraction',
      secondaryCta: 'Read the OCR guide',
      secondaryUrl: '/blog/ai-ocr-calendar-extraction',
      sections: [
        {
          title: 'More than raw text recognition',
          body: 'Traditional OCR reads characters. Calendar extraction also needs context: which text is a title, which line is a location, and which date belongs to which event.',
          links: [{ label: 'Technical OCR guide', url: '/blog/ai-ocr-calendar-extraction' }],
        },
        {
          title: 'Built for messy real-world inputs',
          body: 'Flyers, appointment cards, posters, and schedules often include decorative layouts. AI helps group scattered details into useful event records.',
          links: [
            { label: 'Photo to calendar converter', url: '/photo-to-calendar' },
            { label: 'PDF to calendar converter', url: '/pdf-to-calendar' },
          ],
        },
        {
          title: 'Review keeps quality high',
          body: 'Every extracted event can be checked before export. This keeps automation fast while preserving human control over your calendar.',
        },
      ],
    },
    fr: {
      title: 'Extraction OCR de calendrier',
      intro:
        'PhotoCalia combine OCR et compréhension IA pour reconnaître dates, heures, lieux et titres dans les images, puis les transformer en événements structurés.',
      primaryCta: "Essayer l'extraction IA",
      secondaryCta: 'Lire le guide OCR',
      secondaryUrl: '/blog/ai-ocr-calendar-extraction',
      sections: [
        {
          title: 'Plus que de la reconnaissance de texte',
          body: "Un OCR classique lit des caractères. L'extraction de calendrier doit aussi comprendre le contexte : quel texte est le titre, quelle ligne est le lieu, et quelle date appartient à quel événement.",
          links: [{ label: 'Guide technique OCR', url: '/blog/ai-ocr-calendar-extraction' }],
        },
        {
          title: 'Conçu pour les documents réels',
          body: "Flyers, fiches de rendez-vous, affiches et plannings utilisent souvent des mises en page irrégulières. L'IA aide à regrouper les détails en événements utiles.",
          links: [
            { label: 'Convertisseur photo vers calendrier', url: '/photo-to-calendar' },
            { label: 'Convertisseur PDF vers calendrier', url: '/pdf-to-calendar' },
          ],
        },
        {
          title: 'La vérification maintient la qualité',
          body: "Chaque événement extrait peut être contrôlé avant export. L'automatisation reste rapide, tout en gardant le contrôle humain sur votre calendrier.",
        },
      ],
    },
  },
};

@Component({
  selector: 'app-pillar',
  imports: [RouterLink, LocalizeRoutePipe],
  templateUrl: './pillar.html',
  styleUrl: './pillar.scss',
})
export class Pillar {
  private readonly route = inject(ActivatedRoute);
  private readonly languageService = inject(LanguageService);

  protected readonly content = computed(() => {
    const slug = this.route.snapshot.data['pillarSlug'] as PillarSlug;
    return PILLAR_CONTENT[slug][this.languageService.currentLang()];
  });
}
