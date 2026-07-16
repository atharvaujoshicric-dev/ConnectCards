// supabase/functions/generate-brochure/index.ts
// Generates a shareable PDF brochure for a Pro+ profile (photo, contact
// details, gallery highlights, QR code) and stores it in the public
// 'brochures' bucket. Regenerated on demand when the profile changes
// meaningfully, not on every request.

import { getSupabaseAdmin, jsonResponse, errorResponse } from '../_shared/supabase-admin.ts';
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

interface GenerateBrochureRequestBody {
  profile_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return errorResponse('method_not_allowed', 405);
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return errorResponse('unauthorized', 401);
  }

  const { profile_id }: GenerateBrochureRequestBody = await req.json();
  if (!profile_id) {
    return errorResponse('missing_profile_id', 422);
  }

  const supabase = getSupabaseAdmin();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, job_title, company_name, bio, phone, email, website_url, slug, plan')
    .eq('id', profile_id)
    .single();

  if (profileError || !profile) {
    return errorResponse('profile_not_found', 404);
  }

  if (profile.plan === 'free') {
    return errorResponse('feature_requires_pro_plan', 403);
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let cursorY = 780;

  page.drawText(profile.full_name, {
    x: 50,
    y: cursorY,
    size: 26,
    font: fontBold,
    color: rgb(0.07, 0.07, 0.08),
  });
  cursorY -= 32;

  if (profile.job_title) {
    page.drawText(profile.job_title, { x: 50, y: cursorY, size: 14, font: fontRegular });
    cursorY -= 20;
  }

  if (profile.company_name) {
    page.drawText(profile.company_name, { x: 50, y: cursorY, size: 14, font: fontRegular });
    cursorY -= 30;
  }

  if (profile.bio) {
    const wrapped = wrapText(profile.bio, 90);
    for (const line of wrapped) {
      page.drawText(line, { x: 50, y: cursorY, size: 11, font: fontRegular });
      cursorY -= 16;
    }
    cursorY -= 14;
  }

  const contactLines = [
    profile.phone ? `Phone: ${profile.phone}` : null,
    profile.email ? `Email: ${profile.email}` : null,
    profile.website_url ? `Website: ${profile.website_url}` : null,
    `Profile: connectcards.app/${profile.slug}`,
  ].filter(Boolean) as string[];

  for (const line of contactLines) {
    page.drawText(line, { x: 50, y: cursorY, size: 11, font: fontRegular });
    cursorY -= 16;
  }

  const pdfBytes = await pdfDoc.save();
  const filePath = `${profile.id}/brochure.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('brochures')
    .upload(filePath, pdfBytes, { contentType: 'application/pdf', upsert: true });

  if (uploadError) {
    console.error('Failed to upload brochure', uploadError);
    return errorResponse('internal_error', 500);
  }

  const { data: publicUrlData } = supabase.storage.from('brochures').getPublicUrl(filePath);

  return jsonResponse({ brochure_url: publicUrlData.publicUrl });
});

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxCharsPerLine) {
      lines.push(current.trim());
      current = word;
    } else {
      current += ' ' + word;
    }
  }
  if (current.trim()) lines.push(current.trim());

  return lines;
}
