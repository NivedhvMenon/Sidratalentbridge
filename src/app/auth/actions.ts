'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

import { headers } from 'next/headers';

// Helper to check if email already exists in any table using a secure RPC database function
async function checkEmailExists(email: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('check_email_exists', {
    email_val: email,
  });

  if (error) {
    console.error('RPC check_email_exists error:', error);
    return {
      isCandidate: false,
      isEmployer: false,
      isAdmin: false,
      exists: false,
    };
  }

  // Parse returned json values
  const result = typeof data === 'string' ? JSON.parse(data) : data;

  return {
    isCandidate: !!result.isCandidate,
    isEmployer: !!result.isEmployer,
    isAdmin: !!result.isAdmin,
    exists: !!result.exists,
  };
}

/**
 * Sends OTP to user's email for login.
 * Automatically detects whether the user is a Candidate, Employer, or Admin.
 */
export async function sendLoginOTP(formData: {
  email: string;
}) {
  const { email } = formData;
  const supabase = await createClient();

  try {
    const check = await checkEmailExists(email);

    if (!check.exists) {
      return { error: 'No account found with this email. Please sign up first.' };
    }

    let detectedRole = 'candidate';
    if (check.isAdmin) detectedRole = 'admin';
    else if (check.isEmployer) detectedRole = 'employer';

    // Dynamically get origin from request headers to redirect back to local or production site
    const headersList = await headers();
    const host = headersList.get('host');
    const proto = headersList.get('x-forwarded-proto') || 'http';
    const origin = `${proto}://${host}`;

    // Send OTP
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        data: { role: detectedRole },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, message: 'Verification code sent to your email.' };
  } catch (err: any) {
    return { error: err.message || 'An error occurred while sending the code.' };
  }
}

/**
 * Sends OTP to user's email for signup (either candidate or employer).
 * Verifies that the email is not already in use.
 */
export async function sendSignupOTP(
  role: 'candidate' | 'employer',
  details: {
    email: string;
    phone?: string;
    fullName?: string; // Candidate only
    companyName?: string; // Employer only
    contactName?: string; // Employer only
  }
) {
  const supabase = await createClient();

  try {
    const check = await checkEmailExists(details.email);
    if (check.exists) {
      return { error: 'This email is already registered. Please login instead.' };
    }

    // Prepare signup metadata
    const metadata: any = {
      role,
      phone: details.phone,
    };

    if (role === 'candidate') {
      metadata.full_name = details.fullName;
    } else {
      metadata.company_name = details.companyName;
      metadata.contact_name = details.contactName;
    }

    // Dynamically get origin from request headers
    const headersList = await headers();
    const host = headersList.get('host');
    const proto = headersList.get('x-forwarded-proto') || 'http';
    const origin = `${proto}://${host}`;

    // Send OTP
    const { error } = await supabase.auth.signInWithOtp({
      email: details.email,
      options: {
        shouldCreateUser: true, // Must create user if signup
        data: metadata,
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, message: 'Verification code sent to your email.' };
  } catch (err: any) {
    return { error: err.message || 'An error occurred during signup setup.' };
  }
}

/**
 * Verifies OTP code and logs the user in, auto-routing to their respective dashboard.
 */
export async function verifyOTP(formData: {
  email: string;
  token: string;
}) {
  const { email, token } = formData;
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.user) {
      return { error: 'Authentication failed. Please request a new code.' };
    }

    // Auto-detect role from user metadata or database tables
    let role = data.user.user_metadata?.role;
    if (!role) {
      const check = await checkEmailExists(email);
      if (check.isAdmin) role = 'admin';
      else if (check.isEmployer) role = 'employer';
      else if (check.isCandidate) role = 'candidate';

      if (role) {
        await supabase.auth.updateUser({ data: { role } });
      }
    }

    revalidatePath('/', 'layout');

    // Return destination route
    let redirectUrl = '/dashboard/candidate';
    if (role === 'employer') redirectUrl = '/dashboard/employer';
    if (role === 'admin') redirectUrl = '/admin';

    return { success: true, redirectUrl };
  } catch (err: any) {
    return { error: err.message || 'Verification failed.' };
  }
}

/**
 * Logs out the user.
 */
export async function logOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  revalidatePath('/', 'layout');
  return { success: true };
}

/**
 * Authenticates user using email and password, auto-detecting their role and routing to their dashboard.
 */
export async function loginWithPassword(formData: {
  email: string;
  password: string;
}) {
  const { email, password } = formData;
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.user) {
      return { error: 'Authentication failed. Please verify your credentials.' };
    }

    // Auto-detect role from user metadata or database tables
    let role = data.user.user_metadata?.role;

    if (!role) {
      const check = await checkEmailExists(email);
      if (check.isAdmin) role = 'admin';
      else if (check.isEmployer) role = 'employer';
      else if (check.isCandidate) role = 'candidate';

      if (role) {
        await supabase.auth.updateUser({ data: { role } });
      }
    }

    revalidatePath('/', 'layout');

    let redirectUrl = '/dashboard/candidate';
    if (role === 'employer') redirectUrl = '/dashboard/employer';
    if (role === 'admin') redirectUrl = '/admin';

    return { success: true, redirectUrl };
  } catch (err: any) {
    return { error: err.message || 'Login failed.' };
  }
}

/**
 * Registers a new user with email and password.
 * Saves candidate/employer specific metadata inside auth metadata.
 */
export async function signUpWithPassword(
  role: 'candidate' | 'employer',
  details: {
    email: string;
    password: string;
    phone?: string;
    fullName?: string; // Candidate only
    companyName?: string; // Employer only
    contactName?: string; // Employer only
  }
) {
  const { email, password, phone, fullName, companyName, contactName } = details;
  const supabase = await createClient();

  try {
    const check = await checkEmailExists(email);
    if (check.exists) {
      return { error: 'This email is already registered. Please login instead.' };
    }

    const metadata: any = {
      role,
      phone,
    };

    if (role === 'candidate') {
      metadata.full_name = fullName;
    } else {
      metadata.company_name = companyName;
      metadata.contact_name = contactName;
    }

    const headersList = await headers();
    const host = headersList.get('host');
    const proto = headersList.get('x-forwarded-proto') || 'http';
    const origin = `${proto}://${host}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Check if session was created instantly (e.g. Email Confirmation is disabled)
    if (data.session) {
      let redirectUrl = '/dashboard/candidate';
      if (role === 'employer') redirectUrl = '/dashboard/employer';
      return { success: true, sessionActive: true, redirectUrl };
    }

    return {
      success: true,
      sessionActive: false,
      message: 'Account registered successfully! Please check your email to confirm registration.',
    };
  } catch (err: any) {
    return { error: err.message || 'An error occurred during signup.' };
  }
}
