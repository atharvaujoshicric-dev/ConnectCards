// components/marketing/how-it-works.tsx
const STEPS = [
  {
    number: '01',
    title: 'Order your card',
    body: 'Pick Gold, Silver, Rose Gold, or Black. It ships inert \u2014 not linked to anyone yet.',
  },
  {
    number: '02',
    title: 'Tap once to activate',
    body: 'Log in, tap the card, and it binds permanently to your account. One time, irreversible.',
  },
  {
    number: '03',
    title: 'Share, forever',
    body: 'Tap it against any phone or share your QR. Update your profile anytime \u2014 the card never changes.',
  },
];

export function HowItWorks() {
  return (
    <div className="grid gap-8 sm:grid-cols-3">
      {STEPS.map((step, index) => (
        <div key={step.number} className="relative">
          <span className="font-display text-5xl font-semibold text-accent/25">
            {step.number}
          </span>
          <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
          {index < STEPS.length - 1 && (
            <span
              className="absolute right-[-1rem] top-6 hidden h-px w-8 bg-border sm:block"
              aria-hidden
            />
          )}
        </div>
      ))}
    </div>
  );
}
