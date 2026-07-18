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
      let role = data.user.user_metadata?.role;
      
      // SELF-HEALING: If role is missing from auth user_metadata, query database tables
      if (!role) {
        const userId = data.user.id;
        
        // 1. Check admin_users table
        const { data: adminRow } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', userId)
          .single();
          
        if (adminRow?.role === 'admin') {
          role = 'admin';
        } else {
          // 2. Check candidates table
          const { data: candidateRow } = await supabase
            .from('candidates')
            .select('id')
            .eq('id', userId)
            .single();
            
          if (candidateRow) {
            role = 'candidate';
          } else {
            // 3. Check employers table
            const { data: employerRow } = await supabase
              .from('employers')
              .select('id')
              .eq('id', userId)
              .single();
              
            if (employerRow) {
              role = 'employer';
            }
          }
        }
        
        // Save the resolved role back to user metadata so it's cached for future requests
        if (role) {
          await supabase.auth.updateUser({
            data: { role }
          });
        }
      }
      
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
