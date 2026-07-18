import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase environment variables are missing in middleware. Skipping session refresh.');
      return supabaseResponse;
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh session if expired - required for Server Components
    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    const isCandidateRoute = pathname.startsWith('/dashboard/candidate');
    const isEmployerRoute = pathname.startsWith('/dashboard/employer');
    const isAdminRoute = pathname.startsWith('/admin');

    if (isCandidateRoute || isEmployerRoute || isAdminRoute) {
      if (!user) {
        // User is not authenticated, redirect to login
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirectedFrom', pathname);
        return NextResponse.redirect(url);
      }

      const userRole = user.user_metadata?.role;

      if (isCandidateRoute && userRole !== 'candidate') {
        const url = request.nextUrl.clone();
        url.pathname = userRole === 'employer' ? '/dashboard/employer' : '/login';
        return NextResponse.redirect(url);
      }

      if (isEmployerRoute && userRole !== 'employer') {
        const url = request.nextUrl.clone();
        url.pathname = userRole === 'candidate' ? '/dashboard/candidate' : '/login';
        return NextResponse.redirect(url);
      }

      if (isAdminRoute && userRole !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname =
          userRole === 'candidate'
            ? '/dashboard/candidate'
            : userRole === 'employer'
            ? '/dashboard/employer'
            : '/login';
        return NextResponse.redirect(url);
      }
    }

    // Redirect authenticated users trying to visit login/signup pages to their dashboards
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
    if (isAuthRoute && user) {
      const userRole = user.user_metadata?.role;
      const url = request.nextUrl.clone();
      if (userRole === 'candidate') {
        url.pathname = '/dashboard/candidate';
        return NextResponse.redirect(url);
      } else if (userRole === 'employer') {
        url.pathname = '/dashboard/employer';
        return NextResponse.redirect(url);
      } else if (userRole === 'admin') {
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  } catch (err) {
    console.error('Middleware updateSession failed:', err);
    return NextResponse.next({
      request,
    });
  }
}
