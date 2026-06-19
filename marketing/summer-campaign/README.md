# PhotoCalia Summer Campaign

## Concept

**Campaign:** Tout votre été tient dans une photo

**Format:** 1080 x 1920, approximately 27 seconds, vertical social video

**Primary channels:** Instagram Reels, TikTok, YouTube Shorts

**Purpose:** A reusable seasonal campaign connecting PhotoCalia's current summer exam article
with upcoming blog topics about children's camps, travel itineraries, and festival schedules.

## Timeline

| Time    | Visual                                        | On-screen message                            |
| ------- | --------------------------------------------- | -------------------------------------------- |
| 0-4 s   | Summer schedules scattered around a phone     | Cet été, votre planning ressemble à ça ?     |
| 4-8 s   | Exam, camp, travel and festival cards overlap | Des dates partout.                           |
| 8-12 s  | Phone scans the documents                     | Prenez une photo.                            |
| 12-19 s | Events populate a clean calendar              | Tout votre été. Enfin organisé.              |
| 19-25 s | PhotoCalia brand close and CTA                | Une photo. Tout votre été dans votre agenda. |

## Optional Voice-over

> Cet été, les dates arrivent de partout : examens, camps, voyages, festivals.
> Oubliez la saisie manuelle. Prenez une photo, PhotoCalia détecte les dates,
> les horaires et les lieux, puis organise tout dans votre agenda.
> PhotoCalia. Une photo. Tout votre été dans votre agenda.

## Audio Direction

- Upbeat electronic-pop instrumental, 105-115 BPM.
- Clean percussion and warm synths; avoid vocals beneath the voice-over.
- Add restrained interface sounds at the scan, event appearance, and CTA moments.
- Use a commercially licensed or platform-cleared track before publication.

## Render

```bash
node marketing/summer-campaign/record.mjs fr
node marketing/summer-campaign/record.mjs en
node marketing/summer-campaign/add-audio.mjs fr
node marketing/summer-campaign/add-audio.mjs en
```

The render script uses Google Chrome for capture and `/opt/homebrew/bin/ffmpeg` for the
final H.264 MP4. The editable production masters are `index-fr.html` and `index-en.html`.
The audio script uses macOS system voices for localized voice-over, generates a light
instrumental bed locally, and mixes the final AAC track into the public MP4 assets.

## English Voice-over

> This summer, dates are coming from everywhere: exams, camps, trips, and festivals.
> Forget manual typing. Take a photo, and PhotoCalia detects the dates, times, and places,
> then organizes everything on your calendar. PhotoCalia. One photo. Your whole summer
> on your calendar.

## Image Generation

The background plate was generated with the built-in image generation tool using an
`ads-marketing` prompt. It depicts an overhead summer planning scene with abstract exam,
camp, travel, and festival documents, using PhotoCalia's indigo and violet palette.
