import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const cookieList: any[] = [];
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieList.push({ name, value, options });
              try {
                cookieStore.set(name, value, options);
              } catch {
                // Ignore if cookieStore.set is read-only in this context
              }
            });
          },
        },
      }
    );

    // Exchange the verification code for an active user session (sets cookies in cookieList)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const role = data.user.user_metadata?.role;
      
      // Determine the dashboard destination based on user role
      let targetPath = '/';
      if (role === 'candidate') {
        targetPath = '/dashboard/candidate';
      } else if (role === 'employer') {
        targetPath = '/dashboard/employer';
      } else if (role === 'admin') {
        targetPath = '/admin';
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      let redirectUrl = `${origin}${targetPath}`;
      if (!isLocalEnv && forwardedHost) {
        redirectUrl = `https://${forwardedHost}${targetPath}`;
      }

      const response = NextResponse.redirect(redirectUrl);
      
      // EXPLICIT FIX: Manually copy the auth cookies to the redirect response
      cookieList.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });

      return response;
    } else if (error) {
      console.error('Code exchange failed:', error.message);
    }
  }

  // Fallback if exchange failed
  return NextResponse.redirect(`${origin}/login?error=Could not exchange code for session. Please request a new link.`);
}
