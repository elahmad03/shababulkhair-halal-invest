/**
 * cycle.notifications.ts
 *
 * Handles ALL notifications triggered by cycle lifecycle events.
 * Keeps cycle.service.ts clean — it calls these helpers after
 * its DB transaction commits, never inside it.
 *
 * Design rules:
 *  - Never throw — a failed notification must never roll back a financial operation
 *  - Fire-and-forget — caller does not await; errors are logged only
 *  - Batch emails in chunks to avoid SMTP connection floods
 *  - In-app notifications written in a single prisma.createMany call
 */

import type { ReactElement } from "react";
import { render } from "@react-email/render";
import { prisma } from "../../config/prisma";
import { transporter } from "../../config/mailer"; 
import { CycleOpenedEmail, CycleClosedEmail } from "../../../emails/CycleEmail";

const FROM = '"Shababulkhair Halal Investment" <no-reply@shababulkhair.com>';

// ── Config ────────────────────────────────────────────────────────────────────

/** How many emails to send in parallel per batch. Keeps SMTP from choking. */
const EMAIL_BATCH_SIZE = 20;

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Send one email — swallows errors so a bad address never kills the batch */
async function sendOne(to: string, subject: string, template: ReactElement): Promise<void> {
  try {
    const html = await render(template);
    await transporter.sendMail({ from: FROM, to, subject, html });
  } catch (err) {
    console.error(`[CycleNotifications] Failed to send to ${to}:`, err);
  }
}

/**
 * Process an array in sequential chunks of `size`.
 * Sequential (not Promise.all of all chunks) to be gentle on the SMTP server.
 */
async function sendInBatches<T>(
  items:     T[],
  batchSize: number,
  fn:        (item: T) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    await Promise.allSettled(chunk.map(fn));
  }
}

/** Fetch every ACTIVE member's id + email + firstName in one query */
async function getActiveMembers() {
  return prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: {
      id:        true,
      email:     true,
      firstName: true,
    },
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

interface CycleOpenedPayload {
  cycleId:          string;
  cycleName:        string;
  pricePerShareKobo: bigint;
  endDate?:         Date | null;
}

/**
 * Called after openCycle() commits.
 * Sends email + in-app notification to every ACTIVE member.
 * Non-blocking — caller should NOT await this.
 */
export async function notifyCycleOpened(payload: CycleOpenedPayload): Promise<void> {
  try {
    const members = await getActiveMembers();
    if (members.length === 0) return;

    const pricePerShareNaira = Number(payload.pricePerShareKobo) / 100;
    const endDateFormatted   = payload.endDate
      ? new Date(payload.endDate).toLocaleDateString("en-NG", {
          day: "numeric", month: "long", year: "numeric",
        })
      : undefined;

    // ── 1. In-app notifications (single bulk insert) ──────────────────────
    await prisma.notification.createMany({
      data: members.map((m) => ({
        userId:  m.id,
        title:   "New Investment Cycle Open",
        message: `${payload.cycleName} is now open. Price: ₦${pricePerShareNaira.toLocaleString()} per share.`,
        link:    `/cycles/${payload.cycleId}`,
      })),
      skipDuplicates: true,
    });

    // ── 2. Emails (batched) ───────────────────────────────────────────────
    await sendInBatches(members, EMAIL_BATCH_SIZE, (member) =>
      sendOne(
        member.email,
        `New cycle open: ${payload.cycleName}`,
        CycleOpenedEmail({
          memberFirstName: member.firstName,
          cycleName:       payload.cycleName,
          pricePerShare:   pricePerShareNaira,
          endDate:         endDateFormatted,
        }) as ReactElement
      )
    );

    console.info(
      `[CycleNotifications] Cycle opened — notified ${members.length} members for cycle ${payload.cycleId}`
    );
  } catch (err) {
    // Log but never re-throw — the cycle is already open in the DB
    console.error("[CycleNotifications] notifyCycleOpened failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

interface CycleClosedPayload {
  cycleId:   string;
  cycleName: string;
}

/**
 * Called after activateCycle() commits.
 * Sends personalised email + in-app to every ACTIVE member.
 * Members who invested get their share count in the email.
 * Members who didn't invest get an encouraging "watch for the next one" message.
 * Non-blocking — caller should NOT await this.
 */
export async function notifyCycleClosed(payload: CycleClosedPayload): Promise<void> {
  try {
    const members = await getActiveMembers();
    if (members.length === 0) return;

    // Fetch all investments for this cycle in one query
    const investments = await prisma.shareholderInvestment.findMany({
      where:  { cycleId: payload.cycleId },
      select: { userId: true, sharesAllocated: true, amountInvestedKobo: true },
    });

    // Build a lookup map: userId → investment (undefined if didn't invest)
    const investmentMap = new Map(investments.map((inv) => [inv.userId, inv]));

    // ── 1. In-app notifications ───────────────────────────────────────────
    await prisma.notification.createMany({
      data: members.map((m) => {
        const inv = investmentMap.get(m.id);
        return {
          userId:  m.id,
          title:   "Investment Window Closed",
          message: inv
            ? `${payload.cycleName} is now active. You hold ${inv.sharesAllocated} share(s).`
            : `The investment window for ${payload.cycleName} has closed.`,
          link: `/cycles/${payload.cycleId}`,
        };
      }),
      skipDuplicates: true,
    });

    // ── 2. Personalised emails (batched) ──────────────────────────────────
    await sendInBatches(members, EMAIL_BATCH_SIZE, (member) => {
      const inv = investmentMap.get(member.id);

      return sendOne(
        member.email,
        `Investment window closed: ${payload.cycleName}`,
        CycleClosedEmail({
          memberFirstName:     member.firstName,
          cycleName:           payload.cycleName,
          sharesOwned:         inv ? Number(inv.sharesAllocated) : undefined,
          amountInvestedNaira: inv
            ? Number(inv.amountInvestedKobo) / 100
            : undefined,
        }) as ReactElement
      );
    });

    console.info(
      `[CycleNotifications] Cycle closed — notified ${members.length} members for cycle ${payload.cycleId}`
    );
  } catch (err) {
    console.error("[CycleNotifications] notifyCycleClosed failed:", err);
  }
}