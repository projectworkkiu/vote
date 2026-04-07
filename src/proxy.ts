import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = ['/auth/login', '/api/auth/login', '/api/seed', '/booth'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If a student is already logged in and visits /booth, send them to /vote
    if (pathname === '/booth' && token) {
      const user = verifyToken(token);
      if (user?.role === 'student') {
        return NextResponse.redirect(new URL('/vote', request.url));
      }
    }
    return NextResponse.next();
  }

  // Root redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Check auth for protected routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/vote') || pathname.startsWith('/api')) {
    if (!token) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // Students trying to access /vote without auth go to /booth
      if (pathname.startsWith('/vote')) {
        return NextResponse.redirect(new URL('/booth', request.url));
      }
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const user = verifyToken(token);
    if (!user) {
      const response = pathname.startsWith('/api')
        ? NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        : NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }

    // Role-based access control
    // Students can NEVER access admin routes
    if (pathname.startsWith('/admin') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/vote', request.url));
    }
    // Admins visiting /vote get sent back to admin dashboard
    if (pathname.startsWith('/vote') && user.role !== 'student') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Force password change for admin
    if (user.role === 'admin' && (user as any).mustChangePassword && !pathname.startsWith('/auth/change-password') && !pathname.startsWith('/api/auth')) {
      return NextResponse.redirect(new URL('/auth/change-password', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/vote/:path*', '/auth/:path*', '/api/:path*', '/booth/:path*'],
};

