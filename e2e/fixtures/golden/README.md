# Golden conversion fixtures

These fixtures are synthetic and contain no personal or production data. The SVG sources and expected models were created for PhotoCalia and are released under CC0-1.0 for testing.

`en-calendar` covers timed and all-day English events. `fr-calendrier-flou` covers French text, multiple events, a deliberately softened image and an explicitly clarified day/month date. `dst-boundary` contains a deliberately nonexistent local time during the Europe/Paris spring clock jump; its expected model moves the start to the first valid local time and requires a review warning.

`expected.json` is the machine-readable oracle. A failed check reports the case identifier and field rather than source content, so CI logs do not expose document text.

Generate the committed PNG and PDF renderings with:

```bash
npm run fixtures:generate
```

When adding a supported document class, add its source, generated rendering, expected model, language/timezone, ambiguity behavior and provenance here. Never use a real user's calendar or identity data.
