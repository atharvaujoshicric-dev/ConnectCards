// app/a/[token]/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { lookupCardByToken } from '@/lib/services/cards';
import { ActivateButton } from '@/components/activation/activate-button';
import { CardVisual } from '@/components/marketing/card-visual';
import { Button } from '@/components/ui/button';

interface ActivationPageProps {
  params: Promise<{ token: string }>;
}

export default async function ActivationPage({ params }: ActivationPageProps) {
  const { token } = await params;
  const supabase = await createClient();
  const card = await lookupCardByToken(supabase, token);

  if (!card) {
    return (
      <StatusScreen
        title="We could not find this card"
        body="This activation link does not match a Connect Card in our system. Double-check the link, or contact support if you believe this is an error."
      />
    );
  }

  if (card.status === 'activated' && card.bound_profile_slug) {
    redirect(`/${card.bound_profile_slug}`);
  }

  if (card.status === 'frozen' || card.status === 'revoked') {
    return (
      <StatusScreen
        title="This card is deactivated"
        body="This card has been frozen by its owner or by Connect Cards support. If this is your card and you believe this is a mistake, please contact support."
      />
    );
  }

  if (card.status === 'manufactured') {
    return (
      <StatusScreen
        title="This card is not ready yet"
        body="This card is still in production and has not shipped. It will activate once it is on its way to you."
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="container flex min-h-[80vh] flex-col items-center justify-center gap-10 py-16 md:flex-row md:gap-16">
      <div className="w-full max-w-sm">
        <CardVisual finish={card.color} />
      </div>

      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Activate your Connect Card
        </h1>
        <p className="mt-3 text-muted-foreground">
          This is the last step. Once activated, this card is permanently linked to your account
          and ready to tap.
        </p>

        <div className="mt-8">
          {user ? (
            <ActivateButton activationToken={token} />
          ) : (
            <div className="space-y-4">
              <Button size="lg" variant="accent" className="w-full" asChild>
                <Link href={`/login?redirect_to=${encodeURIComponent(`/a/${token}`)}`}>
                  Log in or sign up to activate
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You need an account before you can claim this card.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusScreen({ title, body }: { title: string; body: string }) {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{body}</p>
      <Button variant="outline" className="mt-8" asChild>
        <Link href="/contact">Contact support</Link>
      </Button>
    </div>
  );
}
