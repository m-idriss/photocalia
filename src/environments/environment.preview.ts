/** Local-only demo configuration. No production Firebase resources or API endpoints. */
export const environment = {
  production: false,
  apiUrl: '/preview-api/v1',
  authEmulatorPort: 9099,
  firebase: {
    apiKey: 'demo-photocalia-preview-key',
    authDomain: 'demo-photocalia-preview.firebaseapp.com',
    projectId: 'demo-photocalia-preview',
    appId: 'demo-photocalia-preview-app',
  },
  contribution: { coffeeUrl: '', snackUrl: '', mealUrl: '' },
  footer: {
    enableRepositoryLink: false,
    enableIssuesLink: false,
    enableDocsLink: false,
    enableLicenseLink: true,
    enableSecurityLink: false,
    enableCommunityLink: false,
    enableDiscussionsLink: false,
    enableAboutMeLink: false,
    enablePrivacyLink: true,
    enableTermsLink: true,
    enableLegalMentionsLink: true,
  },
};
