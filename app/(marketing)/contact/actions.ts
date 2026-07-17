// app/(marketing)/contact/actions.ts
'use server';

import { z } from 'zod';
import { Resend } from 'resend';

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(120),
  email: z.string().email('Enter a valid email address.'),
  company: z.string().max(120).optional(),
  interest: z.enum(['individual', 'business_bulk', 'enterprise_api', 'press', 'other']),
  message: z.string().min(10, 'Tell us a bit more — at least 10 characters.').max(2000),
});

export interface ContactFormState {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company') || undefined,
    interest: formData.get('interest'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME ?? 'Connect Cards'} <${process.env.EMAIL_FROM_ADDRESS ?? 'hello@connectcards.app'}>`,
      to: 'sales@connectcards.app',
      replyTo: parsed.data.email,
      subject: `New contact form submission: ${parsed.data.interest}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(parsed.data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(parsed.data.company ?? '—')}</p>
        <p><strong>Interest:</strong> ${escapeHtml(parsed.data.interest)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(parsed.data.message).replace(/\n/g, '<br />')}</p>
      `,
    });
  } else {
    console.warn('RESEND_API_KEY not set; contact form submission was not emailed.');
  }

  return { success: true, message: 'Thanks — we’ll be in touch within one business day.' };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
