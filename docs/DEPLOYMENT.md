# Deployment Guide

> Complete guide to deploying Photocalia to production

## Deployment Options

Photocalia supports multiple deployment options to fit different hosting environments:

### Static Hosting (Recommended)
- **Platforms**: Netlify, Vercel, GitHub Pages, Firebase Hosting, AWS S3, Azure Static Web Apps
- **Process**: Build and upload the `dist/Photocalia/browser/` directory
- **Requirements**: Static file hosting, no server-side processing needed
- **Benefits**: Fast, scalable, cost-effective

### Traditional Hosting
- **Platforms**: Any web server (Nginx, Apache, IIS)
- **Process**: Deploy built files and configure routing
- **Requirements**: Web server with URL rewriting for SPA routing

## Building for Production

### Production Build

```bash
# Build with production configuration
npm run build -- --configuration=production
```

**Build Output:**
- Location: `dist/Photocalia/browser/`
- Build time: ~14 seconds
- Bundle size: ~2.06 MB raw / 478 kB transferred
- Includes: Minification, tree-shaking, optimization

**Expected Warnings:**
- Bundle size warning (tracked for future optimization)
- Converter styles budget (acceptable)
- These are normal and don't affect functionality

### Build Artifacts

The production build includes:
- Optimized JavaScript bundles
- Compiled CSS
- Service Worker (`ngsw-worker.js`)
- PWA manifest and icons
- `.htaccess` for Apache
- `_redirects` for Netlify

## Automatic Deployment (GitHub Actions)

The project includes automated deployment via GitHub Actions.

### Setup

1. **Configure Secrets**: Add deployment credentials to GitHub repository secrets:
   ```
   Settings → Secrets and variables → Actions → New repository secret
   ```

   Required secrets:
   - `FTP_SERVER` - your-server.com
   - `FTP_USERNAME` - your-username
   - `FTP_PASSWORD` - your-password
   - `FTP_PATH` - /public_html/ (or your web root)

2. **Automatic Trigger**: Deployment triggers on push to `main` branch when relevant files change:
   - Source code (`src/**`, `public/**`)
   - Dependencies (`package.json`, `package-lock.json`)
   - Build configuration (`angular.json`, `tsconfig*.json`)
   - Deployment workflow (`.github/workflows/deploy.yml`)

   **Note**: Documentation changes won't trigger deployment.

3. **Workflow Process**: The GitHub Action will:
   - Check out code
   - Set up Node.js
   - Install dependencies
   - Build production version
   - Deploy via FTP to your server

### Monitoring Deployments

View deployment status:
- **Actions tab** in your GitHub repository
- **Deployment logs** for troubleshooting
- **Status badges** in README (optional)

## Manual Deployment

### Netlify

#### Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build for production
npm run build -- --configuration=production

# Deploy
netlify deploy --prod --dir=dist/Photocalia/browser
```

#### Via Netlify Dashboard

1. Build the project:
   ```bash
   npm run build -- --configuration=production
   ```

2. Drag and drop `dist/Photocalia/browser/` to Netlify dashboard

3. Configure build settings (optional):
   - **Build command**: `npm run build -- --configuration=production`
   - **Publish directory**: `dist/Photocalia/browser`

**Routing**: The `_redirects` file is automatically included in the build.

### Vercel

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Via Vercel Dashboard

1. Import repository from GitHub
2. Configure project:
   - **Framework**: Angular
   - **Build command**: `npm run build -- --configuration=production`
   - **Output directory**: `dist/Photocalia/browser`
3. Deploy

### Firebase Hosting

```bash
# Build for production
npm run build -- --configuration=production

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy everything (hosting + functions)
firebase deploy
```

**Configuration**: `firebase.json` is already configured.

### GitHub Pages

```bash
# Build with base href for GitHub Pages
npm run build -- --configuration=production --base-href=/Photocalia/

# Deploy using gh-pages package
npx angular-cli-ghpages --dir=dist/Photocalia/browser
```

**Note**: Update `--base-href` to match your repository name.

### Traditional Web Server

#### Build

```bash
# Build for production
npm run build -- --configuration=production --base-href=/
```

#### Upload

Upload the contents of `dist/Photocalia/browser/` to your web server using:
- FTP/SFTP client (FileZilla, Cyberduck)
- SSH/SCP
- Hosting panel file manager
- rsync

```bash
# Example: Deploy via rsync
rsync -avz dist/Photocalia/browser/ user@server:/var/www/html/
```

## Server Configuration

### SPA Routing Setup

Angular uses client-side routing. The server must redirect all requests to `index.html`.

#### Apache

✅ **Automatic**: A `.htaccess` file is included in the build output.

Manual configuration (if needed):
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

#### Nginx

Add to your server configuration:
```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Netlify

✅ **Automatic**: A `_redirects` file is included in the build output.

Manual configuration (if needed) in `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### IIS

Create `web.config`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Angular Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Environment Configuration

### Production Environment Variables

Configure environment-specific settings:

#### Netlify/Vercel
Set environment variables in dashboard:
- Go to Site settings → Environment variables
- Add variables (e.g., `FIREBASE_API_KEY`)
- Rebuild to apply

#### Firebase Hosting
Use Firebase configuration:
```bash
firebase functions:config:set someservice.key="THE API KEY"
```

#### Traditional Hosting
- Use server environment variables
- Configure via hosting control panel
- Or use `.env` files (not recommended for secrets)

### API Key Security

For production:
1. Restrict API keys in service provider consoles
2. Set domain restrictions
3. Enable only necessary APIs
4. Use Firebase secrets for backend

See [SECURITY.md](../SECURITY.md) for detailed security guidelines.

## Firebase Functions Deployment

### Prerequisites
- Firebase CLI installed
- Logged into Firebase account
- Functions configured with secrets

### Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:converterFunction

# Deploy with custom project
firebase deploy --only functions --project production
```

### Verify Deployment

```bash
# Check deployment status in hosting dashboard
# or test the live site
curl https://photocalia.com
```

The backend API is hosted separately at the [3dime-api](https://github.com/m-idriss/3dime-api) repository.

## Creating Releases

The project includes an automated release workflow.

### Via GitHub Actions (Recommended)

1. Navigate to **Actions** → **🏷️ Create Tag and Release**
2. Click **Run workflow**
3. Configure:
   - **Version bump type**: `patch`, `minor`, `major`, or `custom`
   - **Custom version**: If using custom (e.g., `1.2.3`)
   - **Pre-release**: Check if beta/alpha
   - **Include build artifacts**: Check to attach build files
4. Click **Run workflow**

### What the Workflow Does

- ✅ Auto-detects current version from `package.json` or git tags
- ✅ Calculates and validates new version number
- ✅ Updates `package.json` with new version
- ✅ Creates annotated git tag (e.g., `v1.2.3`)
- ✅ Generates changelog with commit categorization
- ✅ Creates GitHub release with release notes
- ✅ Optionally builds and attaches artifacts
- ✅ Pushes changes to main branch

### Version Bump Examples

- `patch`: 1.0.0 → 1.0.1 (bug fixes, small changes)
- `minor`: 1.0.0 → 1.1.0 (new features, backwards compatible)
- `major`: 1.0.0 → 2.0.0 (breaking changes)
- `custom`: Specify any version like 2.5.0

See [RELEASE_GUIDE.md](../RELEASE_GUIDE.md) for detailed instructions.

## Post-Deployment Checklist

After deploying, verify:

- [ ] Site loads correctly
- [ ] All pages/routes work
- [ ] Images and assets load
- [ ] API endpoints respond
- [ ] PWA features work (if enabled)
- [ ] Service worker registers
- [ ] Console shows no errors
- [ ] Mobile responsiveness
- [ ] Performance is acceptable
- [ ] Analytics tracking (if configured)

## Performance Optimization

### Build Optimization

Already included in production builds:
- Minification of JavaScript and CSS
- Tree-shaking to remove unused code
- Ahead-of-Time (AOT) compilation
- Code splitting
- Asset compression

### CDN Configuration

For better performance:
1. Use CDN for static assets
2. Configure caching headers
3. Enable compression (gzip/brotli)
4. Set up image optimization

### Monitoring

Track performance with:
- Google Lighthouse
- PageSpeed Insights
- Web Vitals
- Browser DevTools

## Troubleshooting

### Build Fails
**Issue**: Production build fails

**Solutions**:
- Check for TypeScript errors
- Verify all dependencies installed
- Clear `dist/` and rebuild
- Check `angular.json` configuration

### Routes Don't Work
**Issue**: Direct URLs return 404

**Solution**: Configure server redirects (see [Server Configuration](#server-configuration))

### Assets Not Loading
**Issue**: Images or styles missing

**Solutions**:
- Check `--base-href` matches deployment path
- Verify asset paths in code
- Check server MIME types
- Review build output

### PWA Not Installing
**Issue**: Install prompt doesn't appear

**Solutions**:
- Ensure HTTPS (required for PWA)
- Verify `manifest.json` is accessible
- Check service worker registration
- Test in production build (not dev server)

### Firebase Functions Timeout
**Issue**: Functions exceed timeout

**Solutions**:
- Optimize function code
- Increase timeout in `firebase.json`
- Check for infinite loops
- Review API call efficiency

## Rollback

If deployment has issues:

### GitHub Actions
1. Go to Actions → Find successful deployment
2. Re-run the workflow

### Manual Deployment
1. Keep previous build artifacts
2. Re-deploy previous version
3. Or revert Git commits and rebuild

### Firebase
```bash
# View deployment history
firebase hosting:releases:list

# Rollback to previous deployment
firebase hosting:rollback
```

## Security Considerations

Before deploying:

- [ ] Remove development/debug code
- [ ] Check no secrets in source code
- [ ] Configure CORS properly
- [ ] Set up HTTPS/SSL
- [ ] Configure security headers
- [ ] Review Firebase rules
- [ ] Test authentication flows
- [ ] Scan for vulnerabilities

See [SECURITY.md](../SECURITY.md) for comprehensive security guidelines.

## Monitoring & Maintenance

### Health Checks

Set up monitoring for:
- Uptime monitoring
- Error tracking (Sentry, LogRocket)
- Performance monitoring
- User analytics

### Regular Maintenance

- Update dependencies regularly
- Review security advisories
- Monitor bundle size
- Check performance metrics
- Review error logs

## Getting Help

Issues with deployment?

1. Check [Troubleshooting](#troubleshooting) section
2. Review platform-specific documentation
3. Check GitHub Issues
4. Create new issue with deployment logs

---

**Related Documentation:**
- [Installation Guide](./INSTALLATION.md)
- [Firebase Functions](../functions/README.md)
- [Security Policy](../SECURITY.md)
- [Release Guide](../RELEASE_GUIDE.md)
