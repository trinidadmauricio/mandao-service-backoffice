import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Evitar redirecciones innecesarias para rutas de API y archivos estáticos
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Guardar locale en cookie si no existe (sin redirigir)
  if (!request.cookies.get('locale')) {
    const acceptLanguage = request.headers.get('accept-language') || '';
    const detectedLocale = acceptLanguage.includes('en') ? 'en' : 'es';
    
    const response = NextResponse.next();
    response.cookies.set('locale', detectedLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 año
      path: '/',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

