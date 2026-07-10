// app/auth/callback/route.ts
// Handles the redirect Supabase sends the user to after they click the
// magic-link "Sign in" button in the OTP email. Supabase's hosted verify
// endpoint checks the link, then redirects here with a `code` param
// (PKCE flow, the default for @supabase/ssr). We exchange that code for
// a real session cookie, then send the user on to wherever they were
// originally headed.
//
// Without this route, clicking the emailed link lands on a page with no
// session established — which is exactly the gap that was here before.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirect_to') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('That sign-in link is invalid or has expired. Please request a new one.')}`,
  );
}
