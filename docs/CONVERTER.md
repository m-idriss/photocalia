# Calendar converter

Status: current frontend behavior as of 7 August 2026.

PhotoCalia accepts JPG, PNG and PDF files, prepares them in the browser, sends them to the separately operated conversion API, and lets the user review the extracted events before exporting an ICS file.

## User flow

1. Sign in with Google through Firebase Authentication.
2. Upload one or more supported files (10 MB maximum per source file).
3. Convert the files. Multi-file jobs are processed sequentially and can be retried individually.
4. Review, edit or delete every extracted event.
5. Download the regenerated ICS file or open a supported calendar application.

AI extraction is probabilistic. The review step is part of the intended product flow; PhotoCalia does not promise perfect extraction.

## Runtime boundary

| Responsibility | Implementation |
| --- | --- |
| Upload, validation, PDF rendering, review and export | Angular frontend in this repository |
| Authentication | Firebase Authentication with Google Sign-In |
| Conversion, quotas and usage tracking | Quarkus API at `https://api.photocalia.com/v1` |
| Multimodal extraction | Provider selected by server configuration (currently Gemini or Claude) |
| Operational conversion tracking | Private Notion workspace managed by the backend |

The frontend never contains AI-provider credentials. The production backend and its configuration live in the separate `3dime-api` repository and cloud project.

## Frontend responsibilities

The public `ConverterService` remains the stable facade used by the converter screen. Its implementation delegates focused work instead of mixing network, file and calendar concerns:

| Component | Responsibility |
| --- | --- |
| `ConverterApiClientService` | Authenticated conversion and cancellation requests |
| `QuotaService` | Plans, quotas, usage and the temporary legacy quota adapter |
| `FilePreparationService` | File validation, image preparation and PDF rendering |
| `IcsExportService` | Regeneration, validation and download of the reviewed calendar |
| `conversion-state.model.ts` | Valid transitions between idle, validation, processing, review, success and failure |
| `ics.utils.ts` | Pure RFC 5545 parsing, repair, escaping, folding and serialization helpers |
| `calendar-event.utils.ts` | Pure edit-field normalization and stable event validation issue codes |
| `ConverterEventReview` | Event list rendering and edit controls with typed outputs to the orchestration component |
| `ConverterExportActions` | Accuracy confirmation, export/reset controls and the post-download contribution prompt |
| `ConverterBatchProgress` | Batch progress, per-file status, collapse state and retry requests |
| `ConverterUpload` | Drop zone, selected-file thumbnails, preview and conversion request controls |

The main converter now coordinates state and domain actions while focused child components render
upload, batch progress, event review and export controls. All-day values remain date-only strings
through parsing, editing and session restoration so their day cannot shift with the browser
timezone.

## API call

`POST /v1/converter` requires a Firebase ID token.

```json
{
  "files": [
    {
      "dataUrl": "data:image/png;base64,...",
      "name": "calendar.png",
      "type": "image/png"
    }
  ],
  "timeZone": "Europe/Paris",
  "currentDate": "2026-08-07",
  "userId": "firebase-user-id"
}
```

The response contains an ICS document and extracted event data. See [API.md](API.md) for the compatibility boundary. The authoritative OpenAPI artifact must come from the backend release; do not infer a production contract from this example.

## File processing and privacy

- PDFs are rendered to images in the browser with PDF.js before conversion.
- Prepared content is transmitted over HTTPS to the backend and configured AI provider.
- Uploaded content is not intentionally persisted by PhotoCalia after request processing.
- Account, quota, payment and operational tracking records have separate retention obligations described in the public privacy policy and [PRIVACY_OPERATIONS.md](PRIVACY_OPERATIONS.md).

## Development

```bash
npm ci
npm start
npm run test:ci
```

Unit tests mock the remote API. Provider-backed acceptance tests require a deliberately configured test account and must never use personal documents.

## Related documentation

- [Architecture](ARCHITECTURE.md)
- [API boundary](API.md)
- [Privacy operations](PRIVACY_OPERATIONS.md)
- [Testing](TESTING.md)
- [RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545)
