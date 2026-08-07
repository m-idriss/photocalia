# Calendar converter

PhotoCalia accepts JPG, PNG and PDF files and turns their visible schedule information into editable events and a standard ICS export.

## How it works

1. Sign in with Google.
2. Upload one or more files, up to 10 MB per source file.
3. Start conversion. PDF pages are rendered in the browser before processing.
4. Review, edit or delete the extracted events.
5. Download the ICS file for Google Calendar, Apple Calendar, Outlook or another compatible application.

Extraction uses multimodal AI selected by server configuration. Results can contain errors, so review is an intentional and required part of the flow.

## Data handling

Prepared content is sent over HTTPS to the PhotoCalia API and the configured AI provider. Uploaded content is not intentionally stored after the request completes. Account, quota, payment and limited operational tracking records are handled separately as described in the [privacy policy](/privacy).

## Technical boundary

The web application is an Angular frontend hosted on Vercel. Firebase provides Google authentication. Conversion, quotas, subscriptions and operational tracking are handled by a separately operated Quarkus API at `api.photocalia.com`.

For implementation and transfer details, see the source repository documentation.
