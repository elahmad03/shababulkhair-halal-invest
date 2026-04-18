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
          {/* Brand header */}
          <Section style={headerBand}>
            <Heading style={heading}>Shababulkhair</Heading>
            <Text style={tagline}>Empowering communities through finance</Text>
          </Section>

          <Section style={section}>
            <Text style={successBadge}>✅ Payment Confirmed</Text>

            <Text style={text}>
              Assalamu Alaikum, your payment has been received and your booking
              is now active. May this transaction be a means of barakah for you.
            </Text>

            {/* Receipt table */}
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
              <Row style={tableRow}>
                <Column style={tableLabel}>Status</Column>
                <Column style={{ ...tableValue, color: "#059669" }}>Successful</Column>
              </Row>
            </Section>

            <Text style={text}>
              Please log in to your account to submit your requirements and get
              started. If you have any questions, our support team is here to
              help.
            </Text>

            {/* CTA */}
            <Section style={ctaContainer}>
              <Link href="https://shababulkhair.com/dashboard" style={ctaButton}>
                Go to Dashboard →
              </Link>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footer}>Growing together with faith &amp; technology</Text>
          <Text style={footer}>
            &copy; {year} Shababulkhair. All rights reserved.
          </Text>
          <Text style={footer}>
            <Link href="https://shababulkhair.com" style={link}>
              shababulkhair.com
            </Link>
            {" · "}
            <Link href="https://shababulkhair.com/support" style={link}>
              Support
            </Link>
            {" · "}
            <Link href="https://shababulkhair.com/privacy" style={link}>
              Privacy Policy
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentConfirmedEmail;

// ── Styles ────────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: "#f3f4f6",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "0 0 40px",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden" as const,
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

/** Green-tinted header band — distinct from the Halavest blue */
const headerBand = {
  backgroundColor: "#065f46",
  padding: "32px 40px 24px",
  textAlign: "center" as const,
};

const heading = {
  fontSize: "28px",
  fontWeight: "700" as const,
  color: "#ffffff",
  margin: "0 0 4px",
  letterSpacing: "-0.5px",
};

const tagline = {
  fontSize: "13px",
  color: "#a7f3d0",
  margin: "0",
  letterSpacing: "0.5px",
};

const section = {
  padding: "32px 40px 0",
};

const successBadge = {
  fontSize: "20px",
  fontWeight: "700" as const,
  color: "#059669",
  margin: "0 0 16px",
};

const text = {
  fontSize: "15px",
  lineHeight: "26px",
  color: "#4b5563",
  margin: "0 0 16px",
};

const table = {
  width: "100%",
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  border: "1px solid #d1fae5",
  padding: "4px 16px",
  margin: "20px 0 24px",
};

const tableRow = {
  borderBottom: "1px solid #d1fae5",
};

const tableLabel = {
  fontSize: "13px",
  color: "#6b7280",
  width: "40%",
  padding: "10px 0",
};

const tableValue = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#111827",
  padding: "10px 0",
};

const ctaContainer = {
  textAlign: "center" as const,
  margin: "8px 0 32px",
};

const ctaButton = {
  backgroundColor: "#065f46",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600" as const,
  textDecoration: "none",
  padding: "12px 28px",
  borderRadius: "8px",
  display: "inline-block",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "0 0 24px",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  textAlign: "center" as const,
  padding: "0 20px",
  margin: "0 0 4px",
};

const link = {
  color: "#059669",
  textDecoration: "underline",
};