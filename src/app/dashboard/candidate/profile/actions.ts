'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface ProfileUpdateDetails {
  fullName: string;
  phone: string;
  location: string;
  skills: string[];
  experienceSummary: string;
}

/**
 * Updates candidate profile details.
 */
export async function updateCandidateProfile(details: ProfileUpdateDetails) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized. Please login.' };
  }

  const { error } = await supabase
    .from('candidates')
    .update({
      full_name: details.fullName,
      phone: details.phone,
      location: details.location,
      skills: details.skills,
      experience_summary: details.experienceSummary,
    })
    .eq('id', user.id);

  if (error) {
    console.error('Profile update error:', error);
    return { error: error.message };
  }

  // Also sync the full_name to auth metadata
  await supabase.auth.updateUser({
    data: { full_name: details.fullName }
  });

  revalidatePath('/dashboard/candidate/profile');
  return { success: true, message: 'Profile updated successfully.' };
}

/**
 * Uploads candidate's resume to the private Supabase storage bucket.
 * The file is passed from the client as a base64 encoded string.
 */
export async function uploadResumeAction(fileData: {
  base64: string;
  name: string;
  type: string;
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized. Please login.' };
  }

  try {
    const { base64, name, type } = fileData;
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(type)) {
      return { error: 'Invalid file format. Only PDF and DOCX files are allowed.' };
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(base64, 'base64');
    
    // Validate size (max 5MB = 5 * 1024 * 1024 bytes)
    if (fileBuffer.byteLength > 5242880) {
      return { error: 'File size exceeds the 5MB limit.' };
    }

    const ext = name.split('.').pop();
    const storagePath = `${user.id}/resume.${ext}`;

    // Upload to private 'resumes' bucket
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, fileBuffer, {
        contentType: type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return { error: uploadError.message };
    }

    // Save the internal storage path to candidates table
    const { error: dbError } = await supabase
      .from('candidates')
      .update({
        resume_file_url: storagePath
      })
      .eq('id', user.id);

    if (dbError) {
      console.error('Database update resume error:', dbError);
      return { error: dbError.message };
    }

    revalidatePath('/dashboard/candidate/profile');
    return { success: true, message: 'Resume uploaded successfully.' };
  } catch (err: any) {
    console.error('Resume upload action exception:', err);
    return { error: err.message || 'An error occurred during file upload.' };
  }
}

/**
 * Generates a temporary signed URL (valid for 15 minutes) to download/view the user's resume.
 */
export async function getResumeSignedUrlAction() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized. Please login.' };
  }

  // Fetch the candidate's resume path
  const { data: candidate, error: dbError } = await supabase
    .from('candidates')
    .select('resume_file_url')
    .eq('id', user.id)
    .single();

  if (dbError || !candidate?.resume_file_url) {
    return { error: 'No resume path found.' };
  }

  // Create signed URL (expires in 15 minutes = 900 seconds)
  const { data: signedData, error: signedError } = await supabase.storage
    .from('resumes')
    .createSignedUrl(candidate.resume_file_url, 900);

  if (signedError || !signedData?.signedUrl) {
    console.error('Signed URL generation error:', signedError);
    return { error: 'Failed to generate download URL.' };
  }

  return { success: true, signedUrl: signedData.signedUrl };
}
