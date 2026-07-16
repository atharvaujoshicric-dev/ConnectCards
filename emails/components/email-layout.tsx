// emails/components/email-layout.tsx
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>
            Connect<span style={{ color: '#C9A24B' }}>Cards</span>
          </Text>
          <Section>{children}</Section>
          <Hr style={hr} />
          <Text style={footer}>
            Connect Cards &middot; This email was sent regarding your Connect Cards account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#FAF9F6',
  fontFamily: 'Helvetica, Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 24px',
  maxWidth: '480px',
};

const logo = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#131316',
  marginBottom: '24px',
};

const hr = {
  borderColor: '#E5E1D8',
  margin: '32px 0 16px',
};

const footer = {
  fontSize: '12px',
  color: '#8A8A85',
};
