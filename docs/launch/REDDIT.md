# Reddit participation and draft posts

Reddit is not a distribution list. Before posting, use the account normally, read the current community rules, search for prior discussions, and ask moderators when self-promotion is unclear. Always disclose that you made PhotoCalia. Do not repeat the same link across communities or send unsolicited messages.

## r/SideProject draft

Title: I built a review-first tool that turns schedule photos and PDFs into calendar events

Body:

I kept running into the same small administrative problem: the dates I needed were in a photographed timetable, an event flyer or a PDF, while my calendar needed structured events.

So I built PhotoCalia. It prepares events from an image/PDF, but the important part for me is the review step: you can inspect and edit titles, dates, times and locations before downloading an ICS file. I did not want to present probabilistic extraction as a magic one-click import.

The current version supports JPG, PNG, PDF, multiple files, English/French pages and common calendar apps. I’m the maker, and I’m looking for product feedback rather than link votes.

What document type would be the hardest real-world test for this workflow? If links are allowed here, I can add the demo in a comment.

## r/productivity draft

Use only if current rules explicitly permit maker/tool posts.

Title: A review-first workflow for moving paper and PDF schedules into a calendar

Body:

I’m the maker of a small tool called PhotoCalia, and I’d like feedback on the workflow rather than promote a “perfect AI” claim.

The problem: school schedules, club fixtures, appointment cards and flyers often arrive as images or PDFs. The tool prepares calendar events, then requires you to review and correct them before exporting an ICS file.

For people who regularly digitize schedules: which mistakes matter most—day/month ambiguity, all-day events, recurring dates, timezones, or duplicate events? I’m using those answers to shape a privacy-safe test dataset.

I’ll only share the link if that fits the community’s current rules.

## r/webdev draft

Use only for a technical feedback thread allowed by current rules.

Title: Lessons from building an image/PDF-to-ICS flow with Angular and a separate AI API

Body:

I’m building PhotoCalia, an Angular frontend that prepares images/PDF pages, sends them to a separate multimodal API, lets users review events, and regenerates an RFC 5545 ICS export after edits.

The less glamorous engineering work has mattered most: explicit conversion states, machine-readable API errors, all-day semantics, text escaping, deterministic fixtures, and a credential-free browser test that downloads and reparses the ICS.

I’m the maker. I’d be interested in how others test ambiguous dates and timezone boundaries without making provider-backed CI flaky. I can share implementation details if useful and will follow the community’s link rules.

## Response principles

- Answer the question before linking.
- Say “I built it” in the first relevant message.
- Never manufacture testimonials, votes or independent recommendations.
- Remove/update a post if product behavior or pricing changes.
- Record moderator guidance in the launch tracker.
