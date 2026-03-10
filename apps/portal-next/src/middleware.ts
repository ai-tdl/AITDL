import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'hi', 'sa']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Skip api, sitemap, robots, etc.
  if (
    pathname.includes('/api/') ||
    pathname.includes('/robots.txt') ||
    pathname.includes('/sitemap.xml') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/_next/') ||
    pathname.includes('/static/') ||
    pathname.includes('/deadzone/')
  ) {
    return
  }

  // Redirect to default locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
