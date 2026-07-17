// emails/employee-invite.tsx
import { Text, Button } from '@react-email/components';
import { EmailLayout } from './components/email-layout';

interface EmployeeInviteEmailProps {
  organizationName: string;
  inviteUrl: string;
}

export default function EmployeeInviteEmail({
  organizationName = 'Acme Corp',
  inviteUrl = 'https://connectcards.app/signup',
}: EmployeeInviteEmailProps) {
  return (
    <EmailLayout previewText={`${organizationName} invited you to Connect Cards`}>
      <Text style={heading}>You&apos;ve been invited</Text>
      <Text style={paragraph}>
        <strong>{organizationName}</strong> has issued you a Connect Card. Create your account
        with this email address to set up your profile and claim your card once it arrives.
      </Text>
      <Button href={inviteUrl} style={button}>
        Set up my account
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
