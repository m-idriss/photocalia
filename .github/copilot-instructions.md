# Photocalia - Copilot Instructions

**ALWAYS follow these instructions first and fallback to additional search and context gathering only if the information here is incomplete or found to be in error.**

## Project Overview

This is Photocalia, an Angular 20+ SaaS application featuring an AI-powered calendar converter that transforms images and PDFs into ICS calendar files using GPT-4 Vision. The application provides a modern, high-performance interface for converting visual calendar information into downloadable calendar events.

**Project Goals:**
- Provide a robust AI-powered calendar conversion SaaS product
- Maintain high performance and accessibility standards
- Use latest Angular features (standalone components, signals)
- Serve as a reference implementation for Angular best practices

## Table of Contents
- [Quick Start](#working-effectively)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Common Development Tasks](#common-development-tasks)
- [Testing & Validation](#testing-changes)
- [Important Guidelines](#important-guidelines)

## Working Effectively

### Prerequisites and Setup
- Install Node.js 20+
- Chrome/Chromium browser for testing
- **NEVER CANCEL any build or test commands** - builds take ~14 seconds, tests execute in < 1 second

### Bootstrap the Repository
```bash
# Install all dependencies - takes ~30 seconds, NEVER CANCEL
npm install
```

### Build Process
```bash
# Development build - takes ~14 seconds, NEVER CANCEL. Set timeout to 30+ seconds.
npm run build

# Production build - takes ~14 seconds, NEVER CANCEL. Set timeout to 30+ seconds.
npm run build -- --configuration=production
```

**Expected Build Warnings (NORMAL):**
- Bundle size warning: 2.06 MB exceeds 1.80 MB budget by 258.56 kB (tracked for optimization)
- Build output: Initial total 2.06 MB raw size, 479.12 kB estimated transfer size
- CommonJS dependencies may cause optimization warnings - non-breaking

### Development Server
```bash
# Start development server - takes ~4 seconds to start, runs on localhost:4200
npm start
# OR
ng serve
```
The application will be available at `http://localhost:4200/` with hot reload enabled.

### Testing
```bash
# Run tests with headless Chrome - tests execute in < 1 second, NEVER CANCEL. Set timeout to 30+ seconds for build.
CHROME_BIN=/usr/bin/google-chrome-stable npx ng test --browsers=ChromeHeadless --watch=false

# Run tests in watch mode (interactive development)
npm test
```

**Expected Test Behavior:**
- All 100 tests pass successfully ✅
- Tests build and execute in headless Chrome
- Test execution is very fast (< 1 second after build)
- Test providers properly configured (HttpClient, SwUpdate mocked)
- Some INFO logs about Auth service and statistics are expected

### Validation Steps
Always run these steps after making changes:

1. **Build Validation:**
   ```bash
   npm run build
   ```
   - Should complete in ~14 seconds with warnings (normal)
   - Check `dist/photocalia/` directory is created

2. **Application Functionality:**
   ```bash
   npm start
   ```
   - Navigate to `http://localhost:4200/`
   - Verify calendar converter UI displays correctly
   - Test file upload (drag & drop or click to upload)
   - Check authentication flow (sign in button)
   - Verify all sections render correctly (Converter, How It Works, Features, Stats, Footer)

3. **Test Validation:**
   ```bash
   CHROME_BIN=/usr/bin/google-chrome-stable npx ng test --browsers=ChromeHeadless --watch=false
   ```
   - Should show "100 SUCCESS" with all tests passing in ~1 second

### Linting
```bash
# Run ESLint - should complete with "All files pass linting"
npm run lint

# Lints both TypeScript (.ts) and HTML (.html) files
# Configuration: eslint.config.js, angular.json
```

### Code Formatting
```bash
# Format code using Prettier (configured in package.json)
npx prettier --write src/
```

## Project Structure

### Key Directories
```
src/
├── app/
│   ├── components/
│   │   ├── converter/         # Main AI calendar converter component
│   │   ├── calendar-view/     # Calendar event preview and editing
│   │   ├── header/           # App header with navigation
│   │   ├── footer/           # App footer with links
│   │   └── settings/         # Settings modal
│   ├── services/
│   │   ├── auth.service.ts    # Firebase authentication
│   │   ├── converter.service.ts # AI conversion logic
│   │   ├── calendar-state.service.ts # Calendar state management
│   │   └── github.service.ts  # GitHub release info for footer
│   ├── models/               # TypeScript interfaces
│   ├── app.ts                # Main standalone app component
│   └── app.config.ts         # Application configuration
├── environments/             # Environment-specific configs
└── styles.scss              # Global SCSS styles with modern design
```

### Key Files to Know
- `package.json` - Main dependencies and npm scripts
- `angular.json` - Angular project configuration
- `ROADMAP.md` - Comprehensive project roadmap and planning
- `src/styles.scss` - Main styling with CSS custom properties

## Technology Stack

### Frontend
- **Angular 20.3.10** with standalone components
- **TypeScript 5.9.3** for type safety
- **SCSS** for styling with modern CSS features and custom properties
- **RxJS 7.8.2** for reactive programming
- **Glassmorphism** UI design with space theme

### Styling & Design
- **CSS Custom Properties** for theming
- **Modern CSS** with grid, flexbox, and backdrop-filter
- **Responsive Design** with mobile-first approach
- **Glassmorphism UI** with modern gradient backgrounds
- **Accessibility** features and semantic HTML

### Development Tools
- **Angular CLI** for project management and builds
- **Jasmine + Karma** for unit testing
- **Prettier** for code formatting
- **TypeScript strict mode** for type safety

## Configuration

### Development Setup
The application works out-of-the-box with no additional configuration needed.

Environment variables are currently unused but can be added to `src/environments/` for future features.

## Common Development Tasks

### Adding New Components
```bash
# Generate new component with SCSS styling
ng generate component components/my-component --style=scss
```

### Working with Services
Current services:
- `AuthService` - Firebase authentication and user management
- `ConverterService` - AI-powered image/PDF to calendar conversion
- `CalendarStateService` - Manage calendar events state
- `GithubService` - Fetch latest release info for footer version display

### Content Updates
Most content is currently hardcoded in component templates. Future improvements will include:
- JSON-based content management
- Dynamic data loading
- CMS integration options

### Testing Changes
1. **Always start with a clean build:**
   ```bash
   npm run build
   ```

2. **Test in development:**
   ```bash
   npm start
   ```

3. **Validate with tests:**
   ```bash
   CHROME_BIN=/usr/bin/google-chrome-stable npx ng test --browsers=ChromeHeadless --watch=false
   ```

4. **Check production build:**
   ```bash
   npm run build -- --configuration=production
   ```

### Calendar Converter Flow
The application workflow:
1. **File Upload** - User uploads images or PDFs via drag-and-drop or file picker
2. **Authentication** - User signs in with Google (Firebase Auth) for API access
3. **AI Processing** - Files sent to backend API (3dime-api) → GPT-4 Vision API for event extraction
4. **Event Display** - Extracted events shown in calendar view
5. **Event Editing** - User can edit or delete events before download
6. **ICS Export** - User downloads ICS file compatible with all major calendar apps

### Known Limitations
- GPT-4 Vision API requires Firebase authentication
- Some external CDN resources may be blocked in restricted environments
- Backend API is hosted externally (see [3dime-api](https://github.com/m-idriss/3dime-api))
- PDF processing has size limits based on conversion to images

## Important Guidelines

### What TO DO ✅
- **Always run builds and tests** before committing changes
- **Use adequate timeouts** for long-running commands (30+ seconds for builds, tests)
- **Follow existing patterns** in the codebase for consistency
- **Test responsive design** on different screen sizes
- **Verify glassmorphism effects** work in supported browsers
- **Check accessibility** with semantic HTML and ARIA labels
- **Use TypeScript strict mode** for type safety
- **Follow Angular style guide** for component and service structure
- **Use standalone components** (Angular 20+ pattern)

### What NOT TO DO ❌
- **Never cancel build/test commands** - they need time to complete
- **Don't remove working tests** - all current tests pass successfully
- **Don't add dependencies** without checking bundle size impact
- **Don't modify environment files** with real secrets (use .example files)
- **Don't change global styles** without considering all components
- **Don't break responsive design** - test on mobile and desktop
- **Don't ignore accessibility** - maintain WCAG AA compliance
- **Don't use class-based components** - use standalone functional components
- **Don't skip code formatting** - use Prettier before committing
- **Don't push to main directly** - use feature branches

### When to Ask for Help 🤔
Ask the user for guidance when:
- **Security concerns** - handling API keys, authentication, or sensitive data
- **Architecture decisions** - major refactoring or new patterns
- **External dependencies** - adding new npm packages
- **Breaking changes** - modifications that affect existing functionality
- **Unclear requirements** - ambiguous feature requests
- **Performance issues** - bundle size grows significantly
- **Test failures** - unexpected test failures (all tests should pass)

## Debugging Tips

### Build Issues
- Check `angular.json` syntax if build fails
- Verify all dependencies installed with `npm install`
- Clear `dist/` directory and rebuild if needed

### Styling Issues  
- Check CSS custom properties are properly defined in `styles.scss`
- Verify glassmorphism effects work in supported browsers
- Test responsive breakpoints on different screen sizes

### Runtime Issues
- Check browser console for any JavaScript errors
- Test space-themed animations and transitions

## CI/CD & GitHub Actions

### Automated Workflows
The repository has several GitHub Actions workflows in `.github/workflows/`:

1. **qodana_code_quality.yml** - Code quality analysis
   - Runs on PR and push to main
   - Uses JetBrains Qodana for static code analysis
   - Posts PR comments with findings

2. **update-screenshot.yml** - Automated screenshot updates
   - Updates application screenshots automatically

3. **release.yml** - Release workflow for tagging and versioning

4. **Other workflows** - labeler.yml, summary.yml, check-dead-links.yml

### Pre-Deployment Checklist
Before merging to main (which triggers deployment):
- ✅ All tests pass (`CHROME_BIN=/usr/bin/google-chrome-stable npx ng test --browsers=ChromeHeadless --watch=false`)
- ✅ Build succeeds (`npm run build -- --configuration=production`)
- ✅ Lint passes (`npm run lint`)
- ✅ Manual testing completed on localhost:4200

## Deployment

### Static Site Hosting
The `dist/photocalia/browser/` directory contains static files ready for deployment to:
- **Firebase Hosting** (recommended - already configured)
- **Netlify** with automatic builds
- **Vercel** with optimized performance
- **Any static hosting service**

### Manual Deployment
```bash
# Build for production
npm run build -- --configuration=production

# The dist/photocalia/browser/ folder contains deployable files
```

### Firebase Hosting Deployment
```bash
# Deploy hosting only
firebase deploy --only hosting
```

**Note**: The backend API is hosted separately at [3dime-api](https://github.com/m-idriss/3dime-api).
