// emails/CycleOpenedEmail.tsx
import {
  Html, Head, Preview, Body, Container, Section,
  Heading, Text, Hr, Link, Row, Column,
} from "@react-email/components";

interface CycleOpenedEmailProps {
  memberFirstName: string;
  cycleName:       string;
  pricePerShare:   number;   // in Naira
  endDate?:        string;   // human-readable
}

export const CycleOpenedEmail = ({
  memberFirstName,
  cycleName,
  pricePerShare,
  endDate,
}: CycleOpenedEmailProps) => {
  const year = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>New investment cycle is open — {cycleName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Heading style={heading}>Shababulkhair</Heading>
            <Text style={tagline}>Empowering communities through finance</Text>
          </Section>

          <Section style={section}>
            <Text style={badge}>🟢 New Cycle Open for Investment</Text>

            <Text style={text}>
              Assalamu Alaikum {memberFirstName}, a new investment cycle is now
              open. May this be a blessed opportunity for you.
            </Text>

            <Section style={table}>
              <Row style={tableRow}>
                <Column style={tableLabel}>Cycle</Column>
                <Column style={tableValue}>{cycleName}</Column>
              </Row>
              <Row style={tableRow}>
                <Column style={tableLabel}>Price per Share</Column>
                <Column style={tableValue}>₦{pricePerShare.toLocaleString()}</Column>
              </Row>
              {endDate && (
                <Row style={tableRow}>
                  <Column style={tableLabel}>Closes</Column>
                  <Column style={tableValue}>{endDate}</Column>
                </Row>
              )}
              <Row style={tableRow}>
                <Column style={tableLabel}>Status</Column>
                <Column style={{ ...tableValue, color: "#059669" }}>Open</Column>
              </Row>
            </Section>

            <Text style={text}>
              Log in to your dashboard to purchase shares before the investment
              window closes.
            </Text>

            <Section style={ctaContainer}>
              <Link href="https://shababulkhair.com/cycles" style={ctaButton}>
                Invest Now →
              </Link>
            </Section>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>Growing together with faith &amp; technology</Text>
          <Text style={footer}>&copy; {year} Shababulkhair. All rights reserved.</Text>
          <Text style={footer}>
            <Link href="https://shababulkhair.com" style={link}>shababulkhair.com</Link>
            {" · "}
            <Link href="https://shababulkhair.com/support" style={link}>Support</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default CycleOpenedEmail;

// ── Cycle Closed Email ────────────────────────────────────────────────────────

interface CycleClosedEmailProps {
  memberFirstName:    string;
  cycleName:          string;
  sharesOwned?:       number;  // null if member didn't invest
  amountInvestedNaira?: number;
}

export const CycleClosedEmail = ({
  memberFirstName,
  cycleName,
  sharesOwned,
  amountInvestedNaira,
}: CycleClosedEmailProps) => {
  const year = new Date().getFullYear();
  const didInvest = sharesOwned !== undefined && sharesOwned > 0;

  return (
    <Html>
      <Head />
      <Preview>Investment window closed — {cycleName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBand}>
            <Heading style={heading}>Shababulkhair</Heading>
            <Text style={tagline}>Empowering communities through finance</Text>
          </Section>

          <Section style={section}>
            <Text style={badge}>🔴 Investment Window Closed</Text>

            <Text style={text}>
              Assalamu Alaikum {memberFirstName}, the investment window for{" "}
              <strong>{cycleName}</strong> is now closed and funds are being
              deployed.
            </Text>

            {didInvest ? (
              <>
                <Section style={table}>
                  <Row style={tableRow}>
                    <Column style={tableLabel}>Cycle</Column>
                    <Column style={tableValue}>{cycleName}</Column>
                  </Row>
                  <Row style={tableRow}>
                    <Column style={tableLabel}>Your Shares</Column>
                    <Column style={tableValue}>{sharesOwned}</Column>
                  </Row>
                  {amountInvestedNaira !== undefined && (
                    <Row style={tableRow}>
                      <Column style={tableLabel}>Amount Invested</Column>
                      <Column style={tableValue}>
                        ₦{amountInvestedNaira.toLocaleString()}
                      </Column>
                    </Row>
                  )}
                  <Row style={tableRow}>
                    <Column style={tableLabel}>Status</Column>
                    <Column style={{ ...tableValue, color: "#d97706" }}>Active</Column>
                  </Row>
                </Section>
                <Text style={text}>
                  You will be notified when profits are distributed. JazakAllah
                  khair for your participation.
                </Text>
              </>
            ) : (
              <Text style={text}>
                You did not invest in this cycle. Watch out for the next cycle —
                we will notify you when it opens. May the next one be easier for
                you.
              </Text>
            )}

            <Section style={ctaContainer}>
              <Link href="https://shababulkhair.com/user/dashboard" style={ctaButton}>
                View Dashboard →
              </Link>
            </Section>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>Growing together with faith &amp; technology</Text>
          <Text style={footer}>&copy; {year} Shababulkhair. All rights reserved.</Text>
          <Text style={footer}>
            <Link href="https://shababulkhair.com" style={link}>shababulkhair.com</Link>
            {" · "}
            <Link href="https://shababulkhair.com/support" style={link}>Support</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// ── Shared styles ─────────────────────────────────────────────────────────────

const main = {
  backgroundColor: "#f3f4f6",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};
const container = {
  margin: "0 auto", padding: "0 0 40px", maxWidth: "600px",
  backgroundColor: "#ffffff", borderRadius: "12px",
  overflow: "hidden" as const, boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};
const headerBand = {
  backgroundColor: "#065f46", padding: "32px 40px 24px", textAlign: "center" as const,
};
const heading = {
  fontSize: "28px", fontWeight: "700" as const, color: "#ffffff",
  margin: "0 0 4px", letterSpacing: "-0.5px",
};
const tagline  = { fontSize: "13px", color: "#a7f3d0", margin: "0", letterSpacing: "0.5px" };
const section  = { padding: "32px 40px 0" };
const badge    = { fontSize: "18px", fontWeight: "700" as const, color: "#065f46", margin: "0 0 16px" };
const text     = { fontSize: "15px", lineHeight: "26px", color: "#4b5563", margin: "0 0 16px" };
const table    = { width: "100%", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #d1fae5", padding: "4px 16px", margin: "20px 0 24px" };
const tableRow = { borderBottom: "1px solid #d1fae5" };
const tableLabel = { fontSize: "13px", color: "#6b7280", width: "40%", padding: "10px 0" };
const tableValue = { fontSize: "14px", fontWeight: "600" as const, color: "#111827", padding: "10px 0" };
const ctaContainer = { textAlign: "center" as const, margin: "8px 0 32px" };
const ctaButton = {
  backgroundColor: "#065f46", color: "#ffffff", fontSize: "15px",
  fontWeight: "600" as const, textDecoration: "none", padding: "12px 28px",
  borderRadius: "8px", display: "inline-block",
};
const hr     = { borderColor: "#e5e7eb", margin: "0 0 24px" };
const footer = { color: "#9ca3af", fontSize: "12px", lineHeight: "20px", textAlign: "center" as const, padding: "0 20px", margin: "0 0 4px" };
const link   = { color: "#059669", textDecoration: "underline" };