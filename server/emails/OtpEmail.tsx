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
} from "@react-email/components";

interface OtpEmailProps {
  otp: string;
  expirationMinutes: number;
}

export const OtpEmail = ({ otp, expirationMinutes }: OtpEmailProps) => {
  const date = new Date();
  const year = date.getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Your Shababul Khair Halal Investment LTD verification code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Shababul Khair Halal Investment LTD</Heading>
          <Section style={section}>
      
            <Text style={text}>
              Assalamu Alaikum! Welcome to Shababul Khair Halal Investment LTD. Use the following one-time password (OTP) to complete your verification process:
            </Text>
            
            <Text style={otpText}>{otp}</Text>

            <Text style={boldText}>
              This code will expire in {expirationMinutes} minutes.
            </Text>
            <Text style={text}>
              If you did not request this verification, please ignore this email.
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>Growing together with ethical technology</Text>
          <Text style={footer}>&copy; {year} Shababul Khair Halal Investment LTD. All rights reserved.</Text>
          <Text style={footer}>
            <Link href="https://shababulkhairest.com" style={link}>
              shababulkhairest.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OtpEmail;

// --- Styles ---
const main = {
  backgroundColor: "#f0fdf4", // Light mint/Islamic-themed background
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 0",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(22, 101, 52, 0.08)", // Slight green tinted shadow
};

const heading = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#166534", // Deep Islamic Green
  textAlign: "center" as const,
  margin: "20px 0 40px",
  padding: "0 20px",
};

const section = {
  padding: "0 40px",
  display: "flex",
  flexDirection: "column" as const,
  gap: "20px",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
};

const boldText = {
  ...text,
  fontWeight: 600 as const,
  color: "#166534",
};

const otpText = {
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "36px",
  fontWeight: "700",
  letterSpacing: "5px",
  color: "#ffffff",
  backgroundColor: "#166534", // Main Green Brand Color
  padding: "20px 30px",
  borderRadius: "12px",
  textAlign: "center" as const,
  margin: "20px 0",
};

const hr = {
  borderColor: "#dcfce7", // Light green divider
  margin: "30px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  padding: "0 20px",
  marginTop: "10px",
};

const link = {
  color: "#15803d",
  textDecoration: "underline",
};