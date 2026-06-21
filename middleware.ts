import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();

  const protectedRoutes = ['/library', '/folders', '/settings', '/api/prompts', '/api/folders', '/api/categories'];

  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${request.nextUrl.pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
