/**
 * venture.service.ts
 *
 * Manages business ventures within an investment cycle.
 *
 * Key rules enforced here:
 *  - Ventures can only be created/modified on ACTIVE cycles
 *  - Total allocated amount across all ventures must not exceed
 *    the total capital raised by the cycle
 *  - Recording profit updates the parent cycle total atomically
 *  - Profit can be updated multiple times (as installments arrive)
 *    but a venture cannot be deleted once it has recorded profit
 */

import { CycleStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import type { CreateVentureInput, UpdateVentureInput } from "./venture.validators";

// ── Helpers ───────────────────────────────────────────────────────────────────

const toKobo = (naira: number): bigint => BigInt(Math.round(naira * 100));

function serializeBigInts<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

// =============================================================================
// VENTURE SERVICE
// =============================================================================

export default class VentureService {

  // ── CREATE ────────────────────────────────────────────────────────────────

  /**
   * Register a new business venture within an ACTIVE cycle.
   *
   * Security:
   *  - Cycle must be ACTIVE (not PENDING, OPEN, or COMPLETED)
   *  - managedById must be a real user (FK enforced by DB, verified here for clear error)
   *  - Total allocated across all ventures must not exceed cycle's total raised capital
   *    This prevents the committee from allocating more than they actually collected
   */
  static async createVenture(input: CreateVentureInput) {
    const allocatedKobo   = toKobo(input.allocatedAmountNaira);
    const expectedKobo    = toKobo(input.expectedProfitNaira);

    return await prisma.$transaction(async (tx) => {
      // ── 1. Cycle guard ────────────────────────────────────────────────────
      const cycle = await tx.investmentCycle.findUnique({
        where:   { id: input.cycleId },
        include: {
          investments:     { select: { amountInvestedKobo: true } },
          businessVentures: { select: { allocatedAmountKobo: true } },
        },
      });

      if (!cycle) throw new Error("Cycle not found");

      if (cycle.status !== CycleStatus.ACTIVE) {
        throw new Error(
          `Ventures can only be added to ACTIVE cycles — current status is "${cycle.status}".`
        );
      }

      // ── 2. Manager must exist ─────────────────────────────────────────────
      const manager = await tx.user.findUnique({
        where:  { id: input.managedById },
        select: { id: true, status: true },
      });

      if (!manager) throw new Error("Assigned manager not found");
      if (manager.status !== "ACTIVE") {
        throw new Error("Assigned manager account is not active");
      }

      // ── 3. Over-allocation guard ──────────────────────────────────────────
      // Total capital raised = sum of all member investments in this cycle
      const totalRaisedKobo = cycle.investments.reduce(
        (sum, inv) => sum + inv.amountInvestedKobo,
        0n
      );

      // Total already allocated to existing ventures
      const alreadyAllocatedKobo = cycle.businessVentures.reduce(
        (sum, v) => sum + v.allocatedAmountKobo,
        0n
      );

      const remainingKobo = totalRaisedKobo - alreadyAllocatedKobo;

      if (allocatedKobo > remainingKobo) {
        throw new Error(
          `Allocation exceeds available capital. ` +
          `Available: ₦${(Number(remainingKobo) / 100).toLocaleString()}, ` +
          `Requested: ₦${(Number(allocatedKobo) / 100).toLocaleString()}`
        );
      }

      // ── 4. Create ─────────────────────────────────────────────────────────
      const venture = await tx.businessVenture.create({
        data: {
          cycleId:             input.cycleId,
          managedById:         input.managedById,
          companyName:         input.companyName,
          allocatedAmountKobo: allocatedKobo,
          expectedProfitKobo:  expectedKobo,
          profitRealizedKobo:  0n,
        },
        include: {
          managedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          cycle:     { select: { id: true, cycleName: true, status: true } },
        },
      });

      return serializeBigInts(venture);
    });
  }

  // ── UPDATE METADATA ───────────────────────────────────────────────────────

  /**
   * Update non-financial fields on a venture (name, manager, expected profit).
   * Allocated amount is intentionally NOT updatable here — it affects the
   * over-allocation guard and would need a full re-check.
   * Cycle must still be ACTIVE.
   */
  static async updateVenture(ventureId: string, input: UpdateVentureInput) {
    return await prisma.$transaction(async (tx) => {
      const venture = await tx.businessVenture.findUnique({
        where:   { id: ventureId },
        include: { cycle: { select: { status: true } } },
      });

      if (!venture) throw new Error("Venture not found");

      if (venture.cycle.status !== CycleStatus.ACTIVE) {
        throw new Error(
          `Cannot update a venture in a "${venture.cycle.status}" cycle.`
        );
      }

      // Validate new manager if provided
      if (input.managedById) {
        const manager = await tx.user.findUnique({
          where:  { id: input.managedById },
          select: { id: true, status: true },
        });
        if (!manager) throw new Error("New manager not found");
        if (manager.status !== "ACTIVE") throw new Error("New manager account is not active");
      }

      const updated = await tx.businessVenture.update({
        where: { id: ventureId },
        data: {
          ...(input.companyName        && { companyName: input.companyName }),
          ...(input.expectedProfitNaira !== undefined && {
            expectedProfitKobo: toKobo(input.expectedProfitNaira),
          }),
          ...(input.managedById        && { managedById: input.managedById }),
        },
        include: {
          managedBy: { select: { id: true, firstName: true, lastName: true } },
          cycle:     { select: { id: true, cycleName: true } },
        },
      });

      return serializeBigInts(updated);
    });
  }

  // ── RECORD PROFIT ─────────────────────────────────────────────────────────

  /**
   * Record (or update) the realized profit for a venture.
   *
   * This is the key operation that feeds into completeCycle().
   * Every time this is called, it:
   *  1. Sets the venture's profitRealizedKobo to the new value
   *  2. Recalculates the cycle's totalProfitRealizedKobo from scratch
   *     (summing all ventures) — avoids drift from incremental updates
   *
   * Can be called multiple times as profit arrives in installments.
   * The cycle total is always the source of truth.
   */
  static async recordProfit(ventureId: string, profitRealizedNaira: number) {
    const profitKobo = toKobo(profitRealizedNaira);

    return await prisma.$transaction(async (tx) => {
      const venture = await tx.businessVenture.findUnique({
        where:   { id: ventureId },
        include: { cycle: { select: { id: true, status: true, cycleName: true } } },
      });

      if (!venture) throw new Error("Venture not found");

      // Allow profit recording on ACTIVE cycles only
      // (COMPLETED cycles are sealed — no more changes)
      if (venture.cycle.status !== CycleStatus.ACTIVE) {
        throw new Error(
          `Profit can only be recorded on ventures in ACTIVE cycles — ` +
          `current status is "${venture.cycle.status}".`
        );
      }

      // ── 1. Update this venture's realized profit ───────────────────────
      const updatedVenture = await tx.businessVenture.update({
        where: { id: ventureId },
        data:  { profitRealizedKobo: profitKobo },
      });

      // ── 2. Recalculate cycle total from ALL ventures (prevents drift) ──
      const allVentures = await tx.businessVenture.findMany({
        where:  { cycleId: venture.cycleId },
        select: { profitRealizedKobo: true },
      });

      const newCycleTotal = allVentures.reduce(
        (sum, v) => sum + v.profitRealizedKobo,
        0n
      );

      await tx.investmentCycle.update({
        where: { id: venture.cycleId },
        data:  { totalProfitRealizedKobo: newCycleTotal },
      });

      return serializeBigInts({
        venture: {
          id:                  updatedVenture.id,
          companyName:         updatedVenture.companyName,
          allocatedAmountKobo: updatedVenture.allocatedAmountKobo,
          expectedProfitKobo:  updatedVenture.expectedProfitKobo,
          profitRealizedKobo:  updatedVenture.profitRealizedKobo,
        },
        cycle: {
          id:                     venture.cycleId,
          cycleName:              venture.cycle.cycleName,
          totalProfitRealizedKobo: newCycleTotal,
        },
      });
    });
  }

  // ── DELETE ────────────────────────────────────────────────────────────────

  /**
   * Delete a venture — only allowed if:
   *  - Cycle is still ACTIVE
   *  - No profit has been recorded yet (profitRealizedKobo === 0)
   *
   * Deleting a venture with recorded profit would silently reduce the
   * cycle's totalProfitRealizedKobo, which could cheat investors.
   */
  static async deleteVenture(ventureId: string) {
    return await prisma.$transaction(async (tx) => {
      const venture = await tx.businessVenture.findUnique({
        where:   { id: ventureId },
        include: { cycle: { select: { status: true, id: true } } },
      });

      if (!venture) throw new Error("Venture not found");

      if (venture.cycle.status !== CycleStatus.ACTIVE) {
        throw new Error(
          `Cannot delete a venture in a "${venture.cycle.status}" cycle.`
        );
      }

      if (venture.profitRealizedKobo > 0n) {
        throw new Error(
          "Cannot delete a venture that has recorded profit. " +
          "Set profit to 0 first if this was entered in error."
        );
      }

      await tx.businessVenture.delete({ where: { id: ventureId } });

      return { deleted: true, ventureId };
    });
  }

  // ── QUERIES ───────────────────────────────────────────────────────────────

  /** All ventures for a given cycle */
  static async getVenturesByCycle(cycleId: string) {
    const cycle = await prisma.investmentCycle.findUnique({
      where:  { id: cycleId },
      select: { id: true },
    });

    if (!cycle) throw new Error("Cycle not found");

    const ventures = await prisma.businessVenture.findMany({
      where:   { cycleId },
      orderBy: { companyName: "asc" },
      include: {
        managedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Compute summary stats for the response
    const totalAllocatedKobo = ventures.reduce((s, v) => s + v.allocatedAmountKobo, 0n);
    const totalExpectedKobo  = ventures.reduce((s, v) => s + v.expectedProfitKobo,  0n);
    const totalRealizedKobo  = ventures.reduce((s, v) => s + v.profitRealizedKobo,  0n);

    return serializeBigInts({
      ventures,
      summary: {
        count:               ventures.length,
        totalAllocatedKobo,
        totalExpectedKobo,
        totalRealizedKobo,
      },
    });
  }

  /** Single venture detail */
  static async getVentureById(ventureId: string) {
    const venture = await prisma.businessVenture.findUnique({
      where:   { id: ventureId },
      include: {
        managedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        cycle: {
          select: {
            id: true, cycleName: true, status: true,
            totalProfitRealizedKobo: true,
          },
        },
      },
    });

    if (!venture) throw new Error("Venture not found");

    return serializeBigInts(venture);
  }
}