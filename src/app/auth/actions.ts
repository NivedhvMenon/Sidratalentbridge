'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

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
 * Verifies that the email exists for the selected role first.
 */
export async function sendLoginOTP(formData: {
  email: string;
  role: 'candidate' | 'employer' | 'admin';
}) {
  const { email, role } = formData;
  const supabase = await createClient();

  try {
    const check = await checkEmailExists(email);

    if (role === 'candidate' && !check.isCandidate) {
      return { error: 'No candidate profile found. Please sign up first.' };
    }
    if (role === 'employer' && !check.isEmployer) {
      return { error: 'No employer profile found. Please sign up first.' };
    }
    if (role === 'admin' && !check.isAdmin) {
      return { error: 'Access denied. You are not registered as an administrator.' };
    }

    // Send OTP
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Do not create user if not exists during login
        data: { role },
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

    // Send OTP
    const { error } = await supabase.auth.signInWithOtp({
      email: details.email,
      options: {
        shouldCreateUser: true, // Must create user if signup
        data: metadata,
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
 * Verifies OTP code and logs the user in.
 */
export async function verifyOTP(formData: {
  email: string;
  token: string;
  role: 'candidate' | 'employer' | 'admin';
}) {
  const { email, token, role } = formData;
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

    // Ensure session metadata matches the role they used to log in
    const userRole = data.user.user_metadata?.role;
    if (userRole !== role) {
      // In case they signed up as candidate but logged in as employer,
      // this check prevents session hijacks, though sendLoginOTP already blocks this.
      return { error: `Unauthorized. This account is registered as a ${userRole}.` };
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
