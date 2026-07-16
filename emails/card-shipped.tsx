// emails/card-shipped.tsx
import { Text, Button } from '@react-email/components';
import { EmailLayout } from './components/email-layout';

interface CardShippedEmailProps {
  customerName: string;
  trackingNumber: string;
  trackingCarrier: string;
  trackingUrl: string;
}

export default function CardShippedEmail({
  customerName = 'Jane',
  trackingNumber = 'AWB123456789',
  trackingCarrier = 'BlueDart',
  trackingUrl = 'https://connectcards.app/dashboard/orders',
}: CardShippedEmailProps) {
  return (
    <EmailLayout previewText="Your Connect Card has shipped">
      <Text style={heading}>Your card is on its way</Text>
      <Text style={paragraph}>
        Hi {customerName}, your Connect Card has shipped via {trackingCarrier}. Tracking number:{' '}
        <strong>{trackingNumber}</strong>.
      </Text>
      <Text style={paragraph}>
        Once it arrives, tap it against any phone or visit the activation link printed on the
        card to bind it to your account permanently.
      </Text>
      <Button href={trackingUrl} style={button}>
        View order status
      </Button>
    </EmailLayout>
  );
}

const heading = { fontSize: '20px', fontWeight: 700, color: '#131316' };
const paragraph = { fontSize: '14px', color: '#3A3A3D', lineHeight: '22px' };
const button = {
  backgroundColor: '#C9A24B',
  color: '#131316',
  padding: '12px 20px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
  marginTop: '16px',
};
