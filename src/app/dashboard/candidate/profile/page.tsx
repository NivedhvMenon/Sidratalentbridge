import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ProfileForm from './ProfileForm';

export const metadata = {
  title: 'Candidate Profile | Sidra Talent Bridge',
  description: 'Manage and update your professional profile and resume.',
};

export default async function ProfilePage() {
  const supabase = await createClient();

  // Get logged-in user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch current candidate details
  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('full_name, phone, location, skills, experience_summary, resume_file_url')
    .eq('id', user.id)
    .single();

  if (error || !candidate) {
    // If somehow the candidate row is missing, we can create one dynamically
    const { data: newCandidate } = await supabase
      .from('candidates')
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || 'New Candidate',
        email: user.email || '',
      })
      .select()
      .single();

    if (!newCandidate) {
      return (
        <div className="p-6 bg-red-50 text-red-800 rounded-xl border border-red-200">
          <p className="font-bold">Failed to load profile</p>
          <p className="text-xs mt-1">Please ensure your database schema is properly configured.</p>
        </div>
      );
    }

    return <ProfileForm initialProfile={newCandidate} />;
  }

  return <ProfileForm initialProfile={candidate} />;
}
