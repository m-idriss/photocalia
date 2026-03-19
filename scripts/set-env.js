const fs = require('fs');
const path = require('path');

// Configure the path to the environment file
const targetPath = path.join(__dirname, '../src/environments/environment.prod.ts');

// Load environment variables
const apiKey = process.env.FIREBASE_API_KEY || '';
const authDomain = process.env.FIREBASE_AUTH_DOMAIN || '';
const projectId = process.env.FIREBASE_PROJECT_ID || '';
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || '';
const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || '';
const appId = process.env.FIREBASE_APP_ID || '';
const measurementId = process.env.FIREBASE_MEASUREMENT_ID || '';

// Create the environment file content
const packageJson = require('../package.json');
const appVersion = packageJson.version || '0.0.0';

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: 'https://api.photocalia.com',
  appVersion: '${appVersion}',
  firebase: {
    apiKey: '${apiKey}',
    authDomain: '${authDomain}',
    projectId: '${projectId}',
    storageBucket: '${storageBucket}',
    messagingSenderId: '${messagingSenderId}',
    appId: '${appId}',
    measurementId: '${measurementId}',
  },
  footer: {
    enableRepositoryLink: false,
    enableIssuesLink: false,
    enableDocsLink: false,
    enableLicenseLink: true,
    enableSecurityLink: false,
    enableCommunityLink: false,
    enableDiscussionsLink: false,
    enableAboutMeLink: false,
  },
};
`;

// Write the file synchronously so ng build sees it
fs.writeFileSync(targetPath, envConfigFile);
console.log(`Environment file generated at ${targetPath}`);
