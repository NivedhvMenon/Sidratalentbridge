'use server';

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface ContactEmailDetails {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Server action to send a contact form email using Resend.
 * Relays message inputs to info@sidratalentbridge.com.
 */
export async function sendContactEmail(details: ContactEmailDetails) {
  const { name, email, subject, message } = details;

  if (!name || !email || !subject || !message) {
    return { error: 'All fields are required.' };
  }

  try {
    const emailSubject = `Sidra Contact Form: ${subject} (from ${name})`;

    if (resend) {
      const response = await resend.emails.send({
        from: 'Sidra Contact <onboarding@resend.dev>',
        to: 'info@sidratalentbridge.com',
        replyTo: email,
        subject: emailSubject,
        text: `
          Name: ${name}
          Email: ${email}
          Subject: ${subject}
          
          Message:
          ${message}
        `,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
            <h2 style="color: #0f172a; margin-bottom: 20px;">New Contact Form Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="white-space: pre-wrap; color: #334155; line-height: 1.6;"><strong>Message:</strong><br/>${message}</p>
          </div>
        `,
      });

      if (response.error) {
        return { error: response.error.message };
      }

      return { success: true, message: 'Message sent successfully! We will get back to you shortly.' };
    } else {
      // Mock success for development when key is missing
      console.log('MOCK EMAIL (No RESEND_API_KEY):', {
        to: 'info@sidratalentbridge.com',
        from: 'onboarding@resend.dev',
        replyTo: email,
        subject: emailSubject,
        message,
      });

      // Simulate a small delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        success: true,
        message: 'Message simulated (Dev Mode - No API Key). Content logged to console.',
      };
    }
  } catch (err: any) {
    console.error('Contact email send error:', err);
    return { error: err.message || 'An error occurred while sending your message. Please try again.' };
  }
}
