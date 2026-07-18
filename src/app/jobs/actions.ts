'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface CandidateDetails {
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  experienceSummary?: string;
}

interface EmployerRequirementDetails {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  roleNeeded: string;
  description: string;
}

/**
 * Submits a job application.
 * If authenticated, writes to the `applications` database table.
 * If guest, sends the application via email to the administrator/employer.
 */
export async function submitApplication(jobId: string, candidateDetails: CandidateDetails) {
  const supabase = await createClient();
  
  // 1. Get the job details to include in notifications
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*, employers(company_name, email)')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    return { error: 'Job listing not found.' };
  }

  // 2. Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const userRole = user.user_metadata?.role;
    if (userRole === 'candidate') {
      // Check if already applied
      const { data: existingApp } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('candidate_id', user.id)
        .maybeSingle();

      if (existingApp) {
        return { error: 'You have already applied for this job.' };
      }

      // Update candidate details if they supplied a new resume or experience summary
      const updateData: any = {};
      if (candidateDetails.resumeUrl) updateData.resume_file_url = candidateDetails.resumeUrl;
      if (candidateDetails.experienceSummary) updateData.experience_summary = candidateDetails.experienceSummary;
      if (candidateDetails.phone) updateData.phone = candidateDetails.phone;

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('candidates')
          .update(updateData)
          .eq('id', user.id);
      }

      // Insert application
      const { error: appError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          candidate_id: user.id,
          status: 'applied',
        });

      if (appError) {
        return { error: appError.message };
      }

      // Send email notification to Admin/Employer about the application
      try {
        await sendApplicationEmailNotification({
          jobTitle: job.title,
          companyName: job.employers?.company_name || 'Sidra Client',
          applicantName: candidateDetails.fullName,
          applicantEmail: candidateDetails.email,
          applicantPhone: candidateDetails.phone || 'N/A',
          resumeUrl: candidateDetails.resumeUrl || 'Use saved resume',
          experienceSummary: candidateDetails.experienceSummary || 'N/A',
          isGuest: false,
        });
      } catch (emailErr) {
        console.error('Failed to send notification email:', emailErr);
      }

      revalidatePath(`/jobs/${jobId}`);
      return { success: true, message: 'Application submitted successfully!' };
    } else {
      return { error: 'Only candidate accounts can submit job applications.' };
    }
  } else {
    // 3. Guest application flow: Email details directly to administrator/employer
    try {
      await sendApplicationEmailNotification({
        jobTitle: job.title,
        companyName: job.employers?.company_name || 'Sidra Client',
        applicantName: candidateDetails.fullName,
        applicantEmail: candidateDetails.email,
        applicantPhone: candidateDetails.phone || 'N/A',
        resumeUrl: candidateDetails.resumeUrl || 'N/A',
        experienceSummary: candidateDetails.experienceSummary || 'N/A',
        isGuest: true,
      });

      return {
        success: true,
        message: 'Guest application sent successfully! Register a candidate account to track your applications dynamically.',
      };
    } catch (err: any) {
      console.error('Guest application email send error:', err);
      return { error: 'Failed to submit application. Please try again later.' };
    }
  }
}

/**
 * Writes employer leads/requirements to database.
 */
export async function submitEmployerRequirement(details: EmployerRequirementDetails) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('employer_requirements')
    .insert({
      company_name: details.companyName,
      contact_name: details.contactName,
      email: details.email,
      phone: details.phone,
      role_needed: details.roleNeeded,
      description: details.description,
    });

  if (error) {
    return { error: error.message };
  }

  // Send email alert to admin
  try {
    if (resend) {
      await resend.emails.send({
        from: 'Sidra Lead Alert <onboarding@resend.dev>',
        to: 'info@sidratalentbridge.com',
        subject: `New Employer Requirement Lead: ${details.companyName}`,
        text: `
          Company Name: ${details.companyName}
          Contact Name: ${details.contactName}
          Email: ${details.email}
          Phone: ${details.phone || 'N/A'}
          Role Needed: ${details.roleNeeded}
          Description: ${details.description}
        `,
        html: `
          <h3>New Employer Requirement Form Submission</h3>
          <p><strong>Company Name:</strong> ${details.companyName}</p>
          <p><strong>Contact Person:</strong> ${details.contactName}</p>
          <p><strong>Email:</strong> ${details.email}</p>
          <p><strong>Phone:</strong> ${details.phone || 'N/A'}</p>
          <p><strong>Role Needed:</strong> ${details.roleNeeded}</p>
          <p><strong>Requirement Details:</strong> ${details.description}</p>
        `,
      });
    } else {
      console.log('MOCK EMAIL (No RESEND_API_KEY): Employer lead received:', details);
    }
  } catch (emailErr) {
    console.error('Failed to send lead email alert:', emailErr);
  }

  return { success: true, message: 'Requirement submitted successfully! Our representative will contact you shortly.' };
}

/**
 * Internal helper to send email notification for applications.
 */
async function sendApplicationEmailNotification(params: {
  jobTitle: string;
  companyName: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeUrl: string;
  experienceSummary: string;
  isGuest: boolean;
}) {
  const recipient = 'info@sidratalentbridge.com';
  const subject = `Job Application: ${params.applicantName} - ${params.jobTitle} (${params.isGuest ? 'Guest' : 'Candidate'})`;

  if (resend) {
    await resend.emails.send({
      from: 'Sidra Careers <onboarding@resend.dev>',
      to: recipient,
      subject: subject,
      text: `
        New Application for: ${params.jobTitle} at ${params.companyName}
        Applicant: ${params.applicantName} (${params.isGuest ? 'Unauthenticated Guest' : 'Registered Candidate'})
        Email: ${params.applicantEmail}
        Phone: ${params.applicantPhone}
        Resume: ${params.resumeUrl}
        Experience Summary: ${params.experienceSummary}
      `,
      html: `
        <h2>New Job Application</h2>
        <p><strong>Job Title:</strong> ${params.jobTitle}</p>
        <p><strong>Employer / Client:</strong> ${params.companyName}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Applicant Name:</strong> ${params.applicantName} (${params.isGuest ? '<span style="color: #d97706; font-weight: bold;">Guest</span>' : '<span style="color: #2563eb; font-weight: bold;">Registered Candidate</span>'})</p>
        <p><strong>Email:</strong> ${params.applicantEmail}</p>
        <p><strong>Phone:</strong> ${params.applicantPhone}</p>
        <p><strong>Experience Summary:</strong> ${params.experienceSummary}</p>
        <p><strong>Resume URL:</strong> <a href="${params.resumeUrl}" target="_blank">${params.resumeUrl}</a></p>
      `,
    });
  } else {
    console.log(`MOCK EMAIL (No RESEND_API_KEY): ${subject}`, params);
  }
}
