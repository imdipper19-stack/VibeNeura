import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

const intl = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default function middleware(req: NextRequest) {
  const res = intl(req);

  // Capture ?ref=CODE into a long-lived cookie so signup callbacks can pick it up.
  const ref = req.nextUrl.searchParams.get('ref');
  if (ref && /^[A-Za-z0-9_-]{4,32}$/.test(ref)) {
    const target = res ?? NextResponse.next();
    target.cookies.set('omnichat_ref', ref, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return target;
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)'],
};
