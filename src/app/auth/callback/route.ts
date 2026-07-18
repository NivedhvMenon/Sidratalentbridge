import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignored when called from Server Components
            }
          },
        },
      }
    );

    // Exchange the verification code for an active user session (sets cookies)
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
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${targetPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${targetPath}`);
      } else {
        return NextResponse.redirect(`${origin}${targetPath}`);
      }
    }
  }

  // Fallback if exchange failed
  return NextResponse.redirect(`${origin}/login?error=Could not exchange code for session. Please request a new link.`);
}
