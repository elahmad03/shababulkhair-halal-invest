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
      <Preview>Your Halavest verification code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Halavest</Heading>
          <Section style={section}>
      
            <Text style={text}>
              Hello and welcome to Halavest! Use the following one-time password (OTP) to complete your verification process:
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

export default OtpEmail;

// --- Styles ---
const main = {
  backgroundColor: "#f3f4f6", // secondary background
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 0",
  maxWidth: "600px",
  backgroundColor: "#ffffff", // primary foreground
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

const heading = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#3b82f6", // primary color
  textAlign: "center" as const,
  margin: "20px 0 40px",
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
  color: "#4b5563", // secondary foreground
};

const boldText = {
  ...text,
  fontWeight: 600 as const,
};

const otpText = {
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "36px",
  fontWeight: "700",
  letterSpacing: "5px",
  color: "#ffffff",
  backgroundColor: "#3b82f6", // primary color
  padding: "20px 30px",
  borderRadius: "12px",
  textAlign: "center" as const,
  margin: "20px 0",
};

const hr = {
  borderColor: "#d1d5db", // subtle separation
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
  color: "#3b82f6", // primary color
  textDecoration: "underline",
};