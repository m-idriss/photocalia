export const environment = {
  production: true,
  apiUrl: 'https://your-api-url.example.com/v1',
  // Contribution URLs (Stripe payment links) - override with your own or leave as defaults
  contribution: {
    coffeeUrl: 'https://buy.stripe.com/4gM4gA09TalwgRAd7m4Vy01',
    snackUrl: 'https://buy.stripe.com/3cI3cw3m565g9p82sI4Vy00',
    mealUrl: 'https://buy.stripe.com/28E28s1dX79keJs1oE4Vy02',
  },
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.firebasestorage.app',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
  // Footer configuration - these flags control which links appear in the footer
  // Set to false to hide links you don't want to display
  footer: {
    enableRepositoryLink: true,
    enableIssuesLink: true,
    enableDocsLink: true,
    enableLicenseLink: true,
    enableSecurityLink: true,
    enableCommunityLink: true,
    enableDiscussionsLink: true,
    enableAboutMeLink: false,
    enablePrivacyLink: true,
    enableTermsLink: true,
    enableLegalMentionsLink: true,
  },
};
