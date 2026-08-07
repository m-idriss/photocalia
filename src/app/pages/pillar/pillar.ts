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

interface PillarFaq {
  question: string;
  answer: string;
}

interface PillarContent {
  title: string;
  intro: string;
  primaryCta: string;
  secondaryCta: string;
  secondaryUrl: string;
  sections: PillarSection[];
  faqs?: PillarFaq[];
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
        {
          title: 'Turn one image into one or many events',
          body: 'A simple invitation may produce one event, while a class timetable or conference program can produce several. PhotoCalia separates the detected dates and times into editable entries before export.',
        },
        {
          title: 'Check the details before they reach your calendar',
          body: 'Review the event title, start and end times, location, recurrence, and notes. A clear photo with the complete date and time visible gives the best result, especially for dense schedules.',
        },
      ],
      faqs: [
        {
          question: 'How do I add a calendar event from a photo?',
          answer:
            'Upload the photo to PhotoCalia, let the AI extract its dates, times, titles, and locations, review the result, then export or add the event to your preferred calendar.',
        },
        {
          question: 'Can a screenshot be converted into a calendar event?',
          answer:
            'Yes. Screenshots of messages, emails, booking confirmations, flyers, and web pages can be processed when the important event information is readable.',
        },
        {
          question: 'Can one image contain several events?',
          answer:
            'Yes. PhotoCalia can detect several entries in a timetable, program, or schedule and present them separately for review.',
        },
        {
          question: 'Can I edit the extracted event before saving it?',
          answer:
            'Yes. You can verify and correct the title, date, time, location, and description before anything is added to your calendar.',
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
        {
          title: 'Transformez une image en un ou plusieurs événements',
          body: "Une invitation simple peut produire un événement, tandis qu'un emploi du temps ou un programme peut en produire plusieurs. PhotoCalia sépare les dates et horaires détectés en entrées modifiables avant export.",
        },
        {
          title: "Contrôlez les détails avant l'ajout à votre agenda",
          body: "Vérifiez le titre, les heures de début et de fin, le lieu, la récurrence et les notes. Une photo nette où la date et l'heure sont entièrement visibles donne le meilleur résultat.",
        },
      ],
      faqs: [
        {
          question: 'Comment ajouter un événement à mon agenda depuis une photo ?',
          answer:
            "Importez la photo dans PhotoCalia, laissez l'IA extraire dates, horaires, titres et lieux, vérifiez le résultat, puis exportez ou ajoutez l'événement à votre agenda.",
        },
        {
          question: 'Puis-je convertir une capture d’écran en événement ?',
          answer:
            'Oui. Les captures de messages, e-mails, confirmations de réservation, flyers et pages web fonctionnent lorsque les informations importantes sont lisibles.',
        },
        {
          question: 'Une image peut-elle contenir plusieurs événements ?',
          answer:
            'Oui. PhotoCalia peut détecter plusieurs entrées dans un emploi du temps, un programme ou un planning et les présenter séparément pour vérification.',
        },
        {
          question: "Puis-je modifier l'événement extrait avant de l'enregistrer ?",
          answer:
            "Oui. Vous pouvez vérifier et corriger le titre, la date, l'heure, le lieu et la description avant tout ajout à votre agenda.",
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
        {
          title: 'More useful than copying text with generic OCR',
          body: 'Generic OCR gives you a block of text. PhotoCalia identifies which text is the event title, date, start time, end time, location, and description, then prepares structured events you can verify.',
        },
        {
          title: 'Tips for accurate results',
          body: 'Use a clear, well-lit photo, keep the full date and time visible, and avoid strong perspective or blur. For dense multi-page schedules, upload readable pages separately and review every event before export.',
        },
      ],
      faqs: [
        {
          question: 'What types of photos can I convert to calendar events?',
          answer:
            'You can use photos and screenshots of flyers, appointment cards, class timetables, sports schedules, invitations, posters, travel plans, and other documents containing visible dates or times.',
        },
        {
          question: 'Can one photo create multiple calendar events?',
          answer:
            'Yes. A single timetable, agenda, or schedule can contain several events. PhotoCalia extracts them into separate entries so you can review each one before export.',
        },
        {
          question: 'Which calendars accept the result?',
          answer:
            'You can add events to Google Calendar or export a standard ICS file for Apple Calendar, Microsoft Outlook, Yahoo Calendar, and other compatible calendar apps.',
        },
        {
          question: 'Can I correct a date or time before saving?',
          answer:
            'Yes. The extracted title, date, time, location, and description remain editable during the review step. Nothing needs to be added to your calendar before you have checked it.',
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
        {
          title: "Plus utile qu'un simple OCR",
          body: 'Un OCR générique fournit un bloc de texte. PhotoCalia identifie le titre, la date, les heures de début et de fin, le lieu et la description, puis prépare des événements structurés à vérifier.',
        },
        {
          title: 'Conseils pour une extraction précise',
          body: "Utilisez une photo nette et bien éclairée, gardez la date et l'heure entièrement visibles et évitez le flou. Pour un planning dense ou multi-pages, importez des pages lisibles séparément et vérifiez chaque événement.",
        },
      ],
      faqs: [
        {
          question: 'Quels types de photos puis-je convertir en événements ?',
          answer:
            'Vous pouvez utiliser des photos et captures de flyers, fiches de rendez-vous, emplois du temps, plannings sportifs, invitations, affiches ou itinéraires contenant des dates ou des heures visibles.',
        },
        {
          question: 'Une seule photo peut-elle créer plusieurs événements ?',
          answer:
            'Oui. Un emploi du temps, un programme ou un planning peut contenir plusieurs événements. PhotoCalia les extrait séparément afin que vous puissiez vérifier chacun avant export.',
        },
        {
          question: 'Quels calendriers acceptent le résultat ?',
          answer:
            'Vous pouvez ajouter les événements à Google Agenda ou exporter un fichier ICS standard pour Apple Calendrier, Microsoft Outlook, Yahoo Agenda et les autres applications compatibles.',
        },
        {
          question: "Puis-je corriger une date ou une heure avant l'enregistrement ?",
          answer:
            "Oui. Le titre, la date, l'heure, le lieu et la description restent modifiables pendant la vérification. Rien ne doit être ajouté à votre agenda avant votre contrôle.",
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
        {
          title: 'From image to Google Calendar in three steps',
          body: 'Upload the image, review the event details found by AI, then add the result to Google Calendar or download an ICS file. The review step helps prevent incorrect dates or duplicate entries.',
        },
        {
          title: 'Useful for single events and full schedules',
          body: 'Convert one appointment screenshot or extract many entries from a school timetable, sports fixture list, conference agenda, or work schedule without typing each event manually.',
        },
      ],
      faqs: [
        {
          question: 'Can Google Calendar import events from an image by itself?',
          answer:
            'Google Calendar does not provide a general image-upload workflow for extracting every event. PhotoCalia reads the image first, lets you verify the fields, and prepares the events for Google Calendar.',
        },
        {
          question: 'Can I use a screenshot instead of a camera photo?',
          answer:
            'Yes. Screenshots from email, WhatsApp, websites, social media, booking confirmations, and digital flyers work when the date and time are readable.',
        },
        {
          question: 'Does the image need to contain only one event?',
          answer:
            'No. PhotoCalia can identify multiple events in a schedule or agenda and present them as separate entries for review.',
        },
        {
          question: 'Are the extracted events editable?',
          answer:
            'Yes. Review and edit the title, date, time, location, and description before adding anything to Google Calendar or downloading the ICS file.',
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
        {
          title: 'De l’image à Google Agenda en trois étapes',
          body: "Importez l'image, vérifiez les informations trouvées par l'IA, puis ajoutez le résultat à Google Agenda ou téléchargez un fichier ICS. La vérification aide à éviter les mauvaises dates et les doublons.",
        },
        {
          title: 'Pour un événement comme pour un planning complet',
          body: "Convertissez une capture de rendez-vous unique ou extrayez plusieurs entrées d'un emploi du temps scolaire, planning sportif, programme de conférence ou horaire de travail sans tout ressaisir.",
        },
      ],
      faqs: [
        {
          question: 'Google Agenda peut-il importer directement les événements d’une image ?',
          answer:
            "Google Agenda ne propose pas de flux général capable d'extraire tous les événements d'une image. PhotoCalia lit d'abord l'image, vous laisse vérifier les champs, puis prépare les événements pour Google Agenda.",
        },
        {
          question: 'Puis-je utiliser une capture d’écran plutôt qu’une photo ?',
          answer:
            "Oui. Les captures provenant d'un e-mail, de WhatsApp, d'un site, d'un réseau social, d'une réservation ou d'un flyer numérique fonctionnent lorsque la date et l'heure sont lisibles.",
        },
        {
          question: "L'image doit-elle contenir un seul événement ?",
          answer:
            'Non. PhotoCalia peut identifier plusieurs événements dans un planning ou un programme et les présenter séparément pour vérification.',
        },
        {
          question: 'Les événements extraits sont-ils modifiables ?',
          answer:
            "Oui. Vérifiez et modifiez le titre, la date, l'heure, le lieu et la description avant tout ajout à Google Agenda ou téléchargement du fichier ICS.",
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
        {
          title: 'Extract several events without retyping',
          body: 'A PDF may contain one appointment or dozens of sessions. PhotoCalia identifies separate event blocks and prepares editable titles, dates, times, locations, and descriptions for review.',
          links: [{ label: 'Photo to calendar converter', url: '/photo-to-calendar' }],
        },
        {
          title: 'Import the result into your calendar',
          body: 'Once the extracted entries are correct, download the ICS file and open or import it in your calendar app. Always review recurring events, time zones, and multi-day sessions before saving.',
        },
      ],
      faqs: [
        {
          question: 'Can I convert a PDF schedule into calendar events?',
          answer:
            'Yes. Upload a readable PDF containing dates and times, review the events detected by PhotoCalia, then export them as an ICS calendar file.',
        },
        {
          question: 'Can one PDF create multiple events?',
          answer:
            'Yes. Conference programs, exam timetables, class schedules, and activity calendars can contain several events that PhotoCalia separates for review.',
        },
        {
          question: 'Does the PDF need selectable text?',
          answer:
            'No. PhotoCalia can process scanned or image-based PDFs, although clear pages with readable dates, times, and headings produce more reliable results.',
        },
        {
          question: 'Which calendar apps accept the exported file?',
          answer:
            'The ICS format works with Google Calendar, Apple Calendar, Microsoft Outlook, Yahoo Calendar, and most modern calendar applications.',
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
        {
          title: 'Extrayez plusieurs événements sans ressaisie',
          body: "Un PDF peut contenir un rendez-vous ou des dizaines de sessions. PhotoCalia identifie les blocs d'événements et prépare titres, dates, horaires, lieux et descriptions modifiables pour vérification.",
          links: [{ label: 'Convertisseur photo vers calendrier', url: '/photo-to-calendar' }],
        },
        {
          title: 'Importez le résultat dans votre agenda',
          body: "Une fois les entrées vérifiées, téléchargez le fichier ICS et ouvrez-le ou importez-le dans votre application d'agenda. Contrôlez toujours les récurrences, fuseaux horaires et événements sur plusieurs jours.",
        },
      ],
      faqs: [
        {
          question: 'Puis-je convertir un planning PDF en événements ?',
          answer:
            'Oui. Importez un PDF lisible contenant dates et horaires, vérifiez les événements détectés par PhotoCalia, puis exportez-les dans un fichier calendrier ICS.',
        },
        {
          question: 'Un seul PDF peut-il créer plusieurs événements ?',
          answer:
            "Oui. Les programmes de conférence, calendriers d'examens, emplois du temps et plannings d'activités peuvent contenir plusieurs événements séparés pour vérification.",
        },
        {
          question: 'Le texte du PDF doit-il être sélectionnable ?',
          answer:
            "Non. PhotoCalia peut traiter les PDF scannés ou composés d'images, même si des pages nettes avec dates, horaires et titres lisibles donnent des résultats plus fiables.",
        },
        {
          question: 'Quels agendas acceptent le fichier exporté ?',
          answer:
            'Le format ICS fonctionne avec Google Agenda, Apple Calendrier, Microsoft Outlook, Yahoo Agenda et la plupart des applications modernes.',
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
        {
          title: 'From characters to calendar fields',
          body: 'The extraction process turns visual text into structured fields such as title, start date, end date, time, location, and notes. It can also separate multiple entries found in the same schedule.',
        },
        {
          title: 'Improve OCR accuracy at upload time',
          body: 'Use sharp images, include the full document, avoid glare and strong perspective, and keep small print readable. Check ambiguous numeric dates and time zones before exporting the calendar.',
          links: [{ label: 'How PhotoCalia works', url: '/how-it-works' }],
        },
      ],
      faqs: [
        {
          question: 'What is OCR calendar extraction?',
          answer:
            'It is the process of reading event information from an image or scanned document and converting it into structured calendar fields instead of returning only plain text.',
        },
        {
          question: 'What event details can be extracted?',
          answer:
            'PhotoCalia can identify event titles, dates, start and end times, locations, descriptions, and multiple entries when those details are visible in the source.',
        },
        {
          question: 'Can OCR read a timetable with several rows?',
          answer:
            'Yes. A readable timetable can be split into separate event proposals, which you can check and correct individually before export.',
        },
        {
          question: 'How can I improve extraction accuracy?',
          answer:
            'Upload a sharp, well-lit image with the full date and time visible, avoid glare or blur, and review any ambiguous dates, time zones, or recurring events.',
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
        {
          title: 'Des caractères aux champs de calendrier',
          body: "L'extraction transforme le texte visuel en champs structurés : titre, dates de début et de fin, horaires, lieu et notes. Elle peut aussi séparer plusieurs entrées trouvées dans le même planning.",
        },
        {
          title: "Améliorez la précision de l'OCR dès l'import",
          body: 'Utilisez une image nette, incluez le document entier, évitez les reflets et les angles prononcés, et gardez les petits caractères lisibles. Vérifiez les dates numériques ambiguës et les fuseaux horaires avant export.',
          links: [{ label: 'Comment fonctionne PhotoCalia', url: '/how-it-works' }],
        },
      ],
      faqs: [
        {
          question: "Qu'est-ce que l'extraction OCR de calendrier ?",
          answer:
            "C'est la lecture des informations d'événement dans une image ou un document scanné, puis leur conversion en champs structurés plutôt qu'en simple bloc de texte.",
        },
        {
          question: "Quelles informations d'événement peuvent être extraites ?",
          answer:
            'PhotoCalia peut identifier titres, dates, heures de début et de fin, lieux, descriptions et plusieurs entrées lorsque ces informations sont visibles.',
        },
        {
          question: "L'OCR peut-il lire un emploi du temps de plusieurs lignes ?",
          answer:
            'Oui. Un emploi du temps lisible peut être séparé en propositions distinctes que vous contrôlez et corrigez individuellement avant export.',
        },
        {
          question: "Comment améliorer la précision de l'extraction ?",
          answer:
            'Importez une image nette et bien éclairée où la date et les horaires sont visibles, évitez les reflets et vérifiez les dates ambiguës, fuseaux horaires ou récurrences.',
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

  protected readonly faqHeading = computed(() =>
    this.languageService.currentLang() === 'fr'
      ? 'Questions fréquentes'
      : 'Frequently asked questions',
  );
}
