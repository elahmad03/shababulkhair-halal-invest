import nodemailer from "nodemailer";
import { env } from ".";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import dns from "dns";

// Email templates
import { OtpEmail } from "../../emails/OtpEmail";

dns.setDefaultResultOrder("ipv4first");

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: {
    servername: env.SMTP_HOST,
    rejectUnauthorized: true,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

const FROM = '"Shababulkhair Halal Investment" <no-reply@shababulkhair.com>';

// -------------------------
// Base send helper
// -------------------------
async function sendEmail(to: string, subject: string, template: ReactElement) {
  const html = await render(template);
  await transporter.sendMail({ from: FROM, to, subject, html });
}

// -------------------------
// OTP
// -------------------------
export async function sendOTPEmail(email: string, otp: string) {
  await sendEmail(
    email,
    "Your Halavest verification code",
    OtpEmail({ otp, expirationMinutes: Number(env.OTP_EXPIRES_MINUTES) }) as ReactElement
  );
}
