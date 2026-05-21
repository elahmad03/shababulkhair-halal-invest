import { prisma } from "../../config/prisma";
import { BadRequestError, NotFoundError } from "../../utils/errors";
import { UserRole, AccountStatus } from "@prisma/client";

interface ListUsersFilters {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
  kycStatus?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
}

class UserService {
  // ── List all users with filters ───────────────────────────────────────────

  static async listUsers(filters: ListUsersFilters) {
    const { page, limit, search, role, status, kycStatus } = filters;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const whereCondition: any = {};

    if (search) {
      whereCondition.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      whereCondition.role = role as UserRole;
    }

    if (status) {
      whereCondition.status = status as AccountStatus;
    }

    if (kycStatus) {
      whereCondition.kycProfiles = {
        some: {
          kycStatus: kycStatus,
        },
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          role: true,
          status: true,
          createdAt: true,
          kycProfiles: {
            where: { isActive: true },
            select: {
              kycStatus: true,
              updatedAt: true,
            },
            take: 1,
            orderBy: { updatedAt: "desc" },
          },
          investments: {
            select: {
              id: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: whereCondition }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        kyc: user.kycProfiles[0]
          ? { status: user.kycProfiles[0].kycStatus, verificationDate: user.kycProfiles[0].updatedAt }
          : undefined,
        _count: {
          investments: user.investments.length,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ── Get user detail ───────────────────────────────────────────────────────

  static async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        kycProfiles: {
          where: { isActive: true },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
        wallet: true,
        investments: true,
        transactions: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const kyc = user.kycProfiles[0] || null;
    const { kycProfiles, investments, transactions, wallet, password, isEmailVerified, emailVerifiedAt, ...userRest } = user;

    return {
      ...userRest,
      avatarUrl: kyc?.avatarUrl || null,
      kyc: kyc
        ? {
            status: kyc.kycStatus,
            verificationDate: kyc.reviewedAt,
            avatarUrl: kyc.avatarUrl,
            idCardFrontUrl: kyc.idCardFrontUrl,
            idCardBackUrl: kyc.idCardBackUrl,
            streetAddress: kyc.streetAddress,
            city: kyc.city,
            stateRegion: kyc.stateRegion,
            countryCode: kyc.countryCode,
            dateOfBirth: kyc.dateOfBirth,
            governmentIdType: kyc.governmentIdType,
            nextOfKinName: kyc.nextOfKinName,
            nextOfKinRelationship: kyc.nextOfKinRelationship,
            nextOfKinPhone: kyc.nextOfKinPhone,
          }
        : undefined,
      wallet: wallet
        ? {
            id: wallet.id,
            balance: wallet.balanceKobo,
          }
        : undefined,
      _count: {
        investments: investments.length,
        ledgerEntries: transactions.length,
      },
    };
  }

  // ── Get user KYC profile ──────────────────────────────────────────────────

  static async getUserKyc(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        kycProfiles: {
          where: { isActive: true },
          include: {
            auditLogs: {
              orderBy: { createdAt: "desc" },
              take: 5,
            },
          },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.kycProfiles.length) {
      throw new NotFoundError("User KYC profile not found");
    }

    const kyc = user.kycProfiles[0];
    return {
      id: kyc.id,
      status: kyc.kycStatus,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: kyc.dateOfBirth,
      address: kyc.streetAddress,
      city: kyc.city,
      state: kyc.stateRegion,
      country: kyc.countryCode,
      idType: kyc.governmentIdType,
      idDocumentUrl: kyc.idCardFrontUrl,
      proofOfAddressUrl: kyc.idCardBackUrl,
      createdAt: kyc.createdAt,
      updatedAt: kyc.updatedAt,
      verificationDate: kyc.reviewedAt,
      rejectionReason: kyc.rejectedReason,
      submissionDate: kyc.submittedAt,
      kycAuditLogs: kyc.auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        comment: log.meta,
        changedBy: log.actorId,
        createdAt: log.createdAt,
      })),
    };
  }

  // ── Update user status ────────────────────────────────────────────────────

  static async updateUserStatus(
    userId: string,
    status: "ACTIVE" | "SUSPENDED",
    updatedBy: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const validStatus = status === "ACTIVE" ? AccountStatus.ACTIVE : AccountStatus.SUSPENDED;

    if (user.status === validStatus) {
      throw new BadRequestError(`User is already ${status}`);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: validStatus },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // ── Get user investments ──────────────────────────────────────────────────

  static async getUserInvestments(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const investments = await prisma.shareholderInvestment.findMany({
      where: { userId },
      select: {
        id: true,
        cycleId: true,
        cycle: {
          select: {
            id: true,
            cycleName: true,
            status: true,
          },
        },
        amountInvestedKobo: true,
        sharesAllocated: true,
        createdAt: true,
        profitEarnedKobo: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return investments.map((inv) => ({
      id: inv.id,
      ventureId: inv.cycleId,
      venture: {
        id: inv.cycle.id,
        name: inv.cycle.cycleName,
        status: inv.cycle.status,
      },
      cycleId: inv.cycleId,
      cycle: {
        id: inv.cycle.id,
        name: inv.cycle.cycleName,
        status: inv.cycle.status,
      },
      amount: inv.amountInvestedKobo,
      sharesAcquired: inv.sharesAllocated,
      investmentDate: inv.createdAt,
      status: "ACTIVE",
      createdAt: inv.createdAt,
    }));
  }

  // ── Get user transactions ─────────────────────────────────────────────────

  static async getUserTransactions(userId: string, pagination: PaginationParams) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        select: {
          id: true,
          transactionRef: true,
          transactionType: true,
          transactionStatus: true,
          amountKobo: true,
          narration: true,
          relatedEntityId: true,
          relatedEntityType: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      data: transactions.map((txn) => ({
        id: txn.id,
        transactionHash: txn.transactionRef,
        type: txn.transactionType,
        status: txn.transactionStatus,
        amount: txn.amountKobo,
        currency: "NGN",
        description: txn.narration || "",
        relatedVenture: txn.relatedEntityType === "venture" ? { id: txn.relatedEntityId || "", name: "" } : undefined,
        relatedCycle: txn.relatedEntityType === "cycle" ? { id: txn.relatedEntityId || "", name: "" } : undefined,
        createdAt: txn.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export default UserService;
