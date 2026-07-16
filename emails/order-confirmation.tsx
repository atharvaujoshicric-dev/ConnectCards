// emails/order-confirmation.tsx
import { Text, Button, Section, Row, Column } from '@react-email/components';
import { EmailLayout } from './components/email-layout';

interface OrderConfirmationEmailProps {
  customerName: string;
  orderId: string;
  cardColor: string;
  quantity: number;
  totalFormatted: string;
  trackingUrl: string;
}

export default function OrderConfirmationEmail({
  customerName = 'Jane',
  orderId = 'a1b2c3d4',
  cardColor = 'Black',
  quantity = 1,
  totalFormatted = '\u20b91,770',
  trackingUrl = 'https://connectcards.app/dashboard/orders',
}: OrderConfirmationEmailProps) {
  return (
    <EmailLayout previewText={`Your Connect Cards order #${orderId} is confirmed`}>
      <Text style={heading}>Order confirmed</Text>
      <Text style={paragraph}>
        Hi {customerName}, thanks for your order. We&apos;ve started producing your card and
        will email you the moment it ships.
      </Text>

      <Section style={card}>
        <Row>
          <Column>
            <Text style={label}>Order</Text>
            <Text style={value}>#{orderId}</Text>
          </Column>
          <Column>
            <Text style={label}>Card</Text>
            <Text style={value}>
              {quantity} &times; {cardColor}
            </Text>
          </Column>
          <Column>
            <Text style={label}>Total</Text>
            <Text style={value}>{totalFormatted}</Text>
          </Column>
        </Row>
      </Section>

      <Button href={trackingUrl} style={button}>
        Track your order
      </Button>
    </EmailLayout>
  );
}

const heading = { fontSize: '20px', fontWeight: 700, color: '#131316' };
const paragraph = { fontSize: '14px', color: '#3A3A3D', lineHeight: '22px' };
const card = {
  backgroundColor: '#F4F1EA',
  borderRadius: '12px',
  padding: '16px',
  margin: '24px 0',
};
const label = { fontSize: '11px', color: '#8A8A85', margin: 0 };
const value = { fontSize: '14px', fontWeight: 600, color: '#131316', margin: 0 };
const button = {
  backgroundColor: '#C9A24B',
  color: '#131316',
  padding: '12px 20px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
};
