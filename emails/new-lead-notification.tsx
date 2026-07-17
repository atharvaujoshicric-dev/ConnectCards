// emails/new-lead-notification.tsx
import { Text, Button, Section, Row, Column } from '@react-email/components';
import { EmailLayout } from './components/email-layout';

interface NewLeadEmailProps {
  ownerName: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  leadMessage?: string;
  dashboardUrl: string;
}

export default function NewLeadNotificationEmail({
  ownerName = 'Jane',
  leadName = 'Ravi Kumar',
  leadEmail = 'ravi.kumar@example.com',
  leadPhone,
  leadMessage = 'Interested in a consult for a hillside residence project.',
  dashboardUrl = 'https://connectcards.app/dashboard/leads',
}: NewLeadEmailProps) {
  return (
    <EmailLayout previewText={`New lead: ${leadName}`}>
      <Text style={heading}>You have a new lead</Text>
      <Text style={paragraph}>
        Hi {ownerName}, someone just submitted the lead form on your Connect Cards profile.
      </Text>

      <Section style={card}>
        <Row>
          <Column>
            <Text style={label}>Name</Text>
            <Text style={value}>{leadName}</Text>
          </Column>
          <Column>
            <Text style={label}>Contact</Text>
            <Text style={value}>{leadEmail ?? leadPhone ?? '\u2014'}</Text>
          </Column>
        </Row>
        {leadMessage && (
          <>
            <Text style={label}>Message</Text>
            <Text style={value}>{leadMessage}</Text>
          </>
        )}
      </Section>

      <Button href={dashboardUrl} style={button}>
        View in dashboard
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
const label = { fontSize: '11px', color: '#8A8A85', margin: '8px 0 0' };
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
