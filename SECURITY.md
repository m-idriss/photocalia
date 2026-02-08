# Security Policy

## Supported Versions

This project is actively maintained with security updates for the following versions:

| Version    | Supported          |
| ---------- | ------------------ |
| 20.x.x     | :white_check_mark: |
| 19.x.x     | :white_check_mark: |
| < 19.0     | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Email the maintainer with details of the vulnerability
3. Include as much information as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

We will acknowledge your report within 2 business days and provide updates at least every 5 business days. After triage, we will inform you whether the vulnerability will be accepted and fixed, or declined (with reasons). If accepted, we will work with you on disclosure timing and credit.

## Security Best Practices

### Secrets and API Keys

**NEVER commit secrets, API keys, or credentials to the repository.**

#### Environment Configuration

This project uses environment files for configuration:
- `src/environments/environment.ts` - Development configuration
- `src/environments/environment.prod.ts` - Production configuration

**Important:**
- These files are tracked in git and should NOT contain sensitive information
- Use environment variables or secure secret management for production deployments
- Example files are provided: `environment.example.ts` and `environment.prod.example.ts`

#### Firebase Configuration

If you need to add Firebase configuration in the future:

1. **For local development**: Use environment variables
2. **For production**: Use Firebase Hosting environment configuration or secure secret management
3. **Firebase API keys** can be restricted in the Firebase Console:
   - Go to Google Cloud Console → Credentials
   - Restrict the API key to specific domains
   - Enable only the APIs you need

**Note:** Firebase API keys for client-side apps are not secret but should be restricted to prevent abuse.

#### GitHub Secrets

For GitHub Actions and CI/CD:
- Store secrets in GitHub repository settings → Secrets and variables → Actions
- Never echo or log secrets in workflows
- Use minimal permissions for tokens

### Dependencies

- Keep dependencies up to date with `npm audit` and `npm update`
- Review security advisories regularly
- Use `npm audit fix` to automatically fix vulnerabilities when possible

### Code Security

- Avoid using `eval()` or similar dynamic code execution
- Sanitize user inputs
- Use TypeScript strict mode for type safety
- Follow Angular security best practices for XSS prevention

### Deployment Security

- Always use HTTPS in production
- Set appropriate CORS policies - Firebase Functions use an allowlist of trusted origins:
  - Production: `https://photocalia.com`, `https://www.photocalia.com`
  - Development: `http://localhost:4200`, `http://localhost:5000`
  - **Never use** `cors({ origin: true })` which allows all origins
- Use Content Security Policy (CSP) headers
- Enable security headers (X-Frame-Options, X-Content-Type-Options, etc.)

## Security Checklist for Contributors

Before submitting a pull request:

- [ ] No secrets or API keys in the code
- [ ] Dependencies are up to date
- [ ] No `npm audit` high/critical vulnerabilities
- [ ] Input validation for user data
- [ ] Proper error handling without leaking sensitive information
- [ ] HTTPS used for all external API calls
- [ ] CORS policies use allowlists instead of `origin: true`

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Angular Security Guide](https://angular.io/guide/security)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

