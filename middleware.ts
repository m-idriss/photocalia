import { next } from '@vercel/functions';
import { legacyLanguageRedirectUrl } from './src/app/utils/legacy-language-redirect';

export const config = {
  matcher: '/',
};

export default function middleware(request: Request): Response {
  const redirectUrl = legacyLanguageRedirectUrl(request.url);

  return redirectUrl ? Response.redirect(redirectUrl, 308) : next();
}
