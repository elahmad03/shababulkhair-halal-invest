import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Link,
  Row,
  Column,
} from "@react-email/components";

interface PaymentConfirmedEmailProps {
  serviceName: string;
  amount: number;
  referenceId: string;
}

export const PaymentConfirmedEmail = ({
  serviceName,
  amount,
  referenceId,
}: PaymentConfirmedEmailProps) => {
  const year = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Your payment has been confirmed — {referenceId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Halavest</Heading>
          <Section style={section}>
            <Text style={successBadge}>✅ Payment Confirmed</Text>
            <Text style={text}>
              Your payment has been received and your booking is now active.
            </Text>

            <Section style={table}>
              <Row style={tableRow}>
                <Column style={tableLabel}>Service</Column>
                <Column style={tableValue}>{serviceName}</Column>
              </Row>
              <Row style={tableRow}>
                <Column style={tableLabel}>Amount Paid</Column>
                <Column style={tableValue}>₦{amount.toLocaleString()}</Column>
              </Row>
              <Row style={tableRow}>
                <Column style={tableLabel}>Reference</Column>
                <Column style={tableValue}>{referenceId}</Column>
              </Row>
            </Section>

            <Text style={text}>
              Please log in to submit your requirements and get started.
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>Growing together with technology</Text>
          <Text style={footer}>&copy; {year} Halavest. All rights reserved.</Text>
          <Text style={footer}>
            <Link href="https://halavest.com" style={link}>
              halavest.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentConfirmedEmail;

const main = {
  backgroundColor: "#f3f4f6",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 0",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

const heading = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#3b82f6",
  textAlign: "center" as const,
  margin: "20px 0 40px",
};

const section = {
  padding: "0 40px",
};

const successBadge = {
  fontSize: "20px",
  fontWeight: "700" as const,
  color: "#10b981",
  margin: "0 0 16px",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4b5563",
};

const table = {
  width: "100%",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px",
  margin: "20px 0",
};

const tableRow = {
  borderBottom: "1px solid #e5e7eb",
  padding: "8px 0",
};

const tableLabel = {
  fontSize: "14px",
  color: "#6b7280",
  width: "40%",
  padding: "8px 0",
};

const tableValue = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#111827",
  padding: "8px 0",
};

const hr = {
  borderColor: "#d1d5db",
  margin: "30px 0",
};

const footer = {
  color: "#4b5563",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  padding: "0 20px",
  marginTop: "10px",
};

const link = {
  color: "#3b82f6",
  textDecoration: "underline",
};