import { prisma } from "../../config/prisma";
import { BadRequestError, NotFoundError } from "../../utils/errors";
import { UserRole, AccountStatus, KycStatus } from "@prisma/client";

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
          isEmailVerified: true,
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
        isEmailVerified: user.isEmailVerified,
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
          include: {
            auditLogs: {
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { version: "desc" },
        },
        wallet: true,
        investments: true,
        transactions: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    let editLogs: Array<{
      id: string;
      field: string;
      oldValue: string | null;
      newValue: string | null;
      createdAt: Date;
      editedBy?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }> = [];

    try {
      if ((prisma as any).userEditLog) {
        editLogs = await (prisma as any).userEditLog.findMany({
          where: { targetUserId: userId },
          include: {
            editedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      }
    } catch {
      editLogs = [];
    }

    const activeKyc = user.kycProfiles.find((p) => p.isActive) || user.kycProfiles[0] || null;
    const { kycProfiles, investments, transactions, wallet, password, emailVerifiedAt, ...userRest } = user;

    return {
      ...userRest,
      isEmailVerified: user.isEmailVerified,
      avatarUrl: activeKyc?.avatarUrl || null,
      kyc: activeKyc
        ? {
            id: activeKyc.id,
            version: activeKyc.version,
            status: activeKyc.kycStatus,
            kycStatus: activeKyc.kycStatus,
            verificationDate: activeKyc.reviewedAt,
            reviewedAt: activeKyc.reviewedAt,
            submissionDate: activeKyc.submittedAt,
            submittedAt: activeKyc.submittedAt,
            rejectionReason: activeKyc.rejectedReason,
            avatarUrl: activeKyc.avatarUrl,
            streetAddress: activeKyc.streetAddress,
            address: activeKyc.streetAddress,
            city: activeKyc.city,
            stateRegion: activeKyc.stateRegion,
            state: activeKyc.stateRegion,
            countryCode: activeKyc.countryCode,
            country: activeKyc.countryCode,
            dateOfBirth: activeKyc.dateOfBirth,
            governmentIdType: activeKyc.governmentIdType,
            idType: activeKyc.governmentIdType,
            idCardFrontUrl: activeKyc.idCardFrontUrl,
            idDocumentUrl: activeKyc.idCardFrontUrl,
            idCardBackUrl: activeKyc.idCardBackUrl,
            proofOfAddressUrl: activeKyc.idCardBackUrl,
            nextOfKinName: activeKyc.nextOfKinName,
            nextOfKinRelationship: activeKyc.nextOfKinRelationship,
            nextOfKinPhone: activeKyc.nextOfKinPhone,
          }
        : undefined,
      kycVersions: kycProfiles.map((p) => ({
        id: p.id,
        version: p.version,
        isActive: p.isActive,
        status: p.kycStatus,
        submittedAt: p.submittedAt,
        reviewedAt: p.reviewedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        rejectedReason: p.rejectedReason,
      })),
      editLogs: editLogs.map((log) => ({
        id: log.id,
        field: log.field,
        oldValue: log.oldValue,
        newValue: log.newValue,
        createdAt: log.createdAt,
        editedBy: log.editedBy
          ? {
              id: log.editedBy.id,
              fullName: `${log.editedBy.firstName} ${log.editedBy.lastName}`,
              email: log.editedBy.email,
            }
          : undefined,
      })),
      wallet: wallet
        ? {
            id: wallet.id,
            balance: Number(wallet.balanceKobo),
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
      version: kyc.version,
      status: kyc.kycStatus,
      kycStatus: kyc.kycStatus,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: kyc.dateOfBirth,
      streetAddress: kyc.streetAddress,
      address: kyc.streetAddress,
      city: kyc.city,
      stateRegion: kyc.stateRegion,
      state: kyc.stateRegion,
      countryCode: kyc.countryCode,
      country: kyc.countryCode,
      governmentIdType: kyc.governmentIdType,
      idType: kyc.governmentIdType,
      idCardFrontUrl: kyc.idCardFrontUrl,
      idDocumentUrl: kyc.idCardFrontUrl,
      idCardBackUrl: kyc.idCardBackUrl,
      proofOfAddressUrl: kyc.idCardBackUrl,
      avatarUrl: kyc.avatarUrl,
      nextOfKinName: kyc.nextOfKinName,
      nextOfKinRelationship: kyc.nextOfKinRelationship,
      nextOfKinPhone: kyc.nextOfKinPhone,
      createdAt: kyc.createdAt,
      updatedAt: kyc.updatedAt,
      verificationDate: kyc.reviewedAt,
      reviewedAt: kyc.reviewedAt,
      rejectionReason: kyc.rejectedReason,
      submissionDate: kyc.submittedAt,
      submittedAt: kyc.submittedAt,
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

  // ── Admin edit any user field with UserEditLog audit trail ──────────────────

  static async editUser(
    targetUserId: string,
    adminId: string,
    updates: Record<string, any>
  ) {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: targetUserId },
        include: {
          kycProfiles: {
            where: { isActive: true },
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      const logsToCreate: Array<{
        targetUserId: string;
        editedById: string;
        field: string;
        oldValue: string | null;
        newValue: string | null;
      }> = [];

      // ── User account fields (role is strictly DB-only) ──
      const userFields = ["firstName", "lastName", "email", "phoneNumber", "status", "isEmailVerified"] as const;
      const sanitizedUserUpdates: Record<string, any> = {};

      for (const field of userFields) {
        if (updates[field] !== undefined) {
          const oldVal = (user as any)[field];
          const newVal = updates[field];
          if (oldVal !== newVal) {
            sanitizedUserUpdates[field] = newVal;
            logsToCreate.push({
              targetUserId,
              editedById: adminId,
              field,
              oldValue: oldVal !== null && oldVal !== undefined ? String(oldVal) : null,
              newValue: newVal !== null && newVal !== undefined ? String(newVal) : null,
            });
          }
        }
      }

      // ── KYC Profile fields ──
      const activeKyc = user.kycProfiles[0] || null;
      const kycStringFields = [
        "streetAddress",
        "city",
        "stateRegion",
        "countryCode",
        "governmentIdType",
        "nextOfKinName",
        "nextOfKinRelationship",
        "nextOfKinPhone",
      ] as const;

      const sanitizedKycUpdates: Record<string, any> = {};

      for (const field of kycStringFields) {
        if (updates[field] !== undefined) {
          const oldVal = activeKyc ? (activeKyc as any)[field] ?? "" : "";
          const newVal = updates[field] ?? "";
          if (oldVal !== newVal) {
            sanitizedKycUpdates[field] = newVal;
            logsToCreate.push({
              targetUserId,
              editedById: adminId,
              field: `kyc.${field}`,
              oldValue: oldVal ? String(oldVal) : null,
              newValue: newVal ? String(newVal) : null,
            });
          }
        }
      }

      // Date of birth
      if (updates.dateOfBirth !== undefined) {
        const newDob = updates.dateOfBirth ? new Date(updates.dateOfBirth) : null;
        const oldDobStr = activeKyc?.dateOfBirth ? activeKyc.dateOfBirth.toISOString().split("T")[0] : null;
        const newDobStr = newDob ? newDob.toISOString().split("T")[0] : null;

        if (oldDobStr !== newDobStr) {
          sanitizedKycUpdates.dateOfBirth = newDob;
          logsToCreate.push({
            targetUserId,
            editedById: adminId,
            field: "kyc.dateOfBirth",
            oldValue: oldDobStr,
            newValue: newDobStr,
          });
        }
      }

      // KYC Status
      if (updates.kycStatus !== undefined) {
        const oldStatus = activeKyc?.kycStatus ?? "NOT_SUBMITTED";
        const newStatus = updates.kycStatus;
        if (oldStatus !== newStatus) {
          sanitizedKycUpdates.kycStatus = newStatus as KycStatus;
          logsToCreate.push({
            targetUserId,
            editedById: adminId,
            field: "kyc.kycStatus",
            oldValue: oldStatus,
            newValue: newStatus,
          });
        }
      }

      if (logsToCreate.length === 0) {
        return;
      }

      // Persist logs
      await tx.userEditLog.createMany({
        data: logsToCreate,
      });

      // Update user
      if (Object.keys(sanitizedUserUpdates).length > 0) {
        await tx.user.update({
          where: { id: targetUserId },
          data: sanitizedUserUpdates,
        });
      }

      // Update or create KYC
      if (Object.keys(sanitizedKycUpdates).length > 0) {
        if (activeKyc) {
          await tx.kycProfile.update({
            where: { id: activeKyc.id },
            data: sanitizedKycUpdates,
          });
          await tx.kycAuditLog.create({
            data: {
              action: "ADMIN_EDIT",
              actorId: adminId,
              kycId: activeKyc.id,
              meta: JSON.stringify(sanitizedKycUpdates),
            },
          });
        } else {
          const createdKyc = await tx.kycProfile.create({
            data: {
              userId: targetUserId,
              version: 1,
              isActive: true,
              nextOfKinName: sanitizedKycUpdates.nextOfKinName || "Not provided",
              nextOfKinRelationship: sanitizedKycUpdates.nextOfKinRelationship || "Not provided",
              nextOfKinPhone: sanitizedKycUpdates.nextOfKinPhone || "Not provided",
              ...sanitizedKycUpdates,
            },
          });
          await tx.kycAuditLog.create({
            data: {
              action: "ADMIN_CREATE",
              actorId: adminId,
              kycId: createdKyc.id,
              meta: JSON.stringify(sanitizedKycUpdates),
            },
          });
        }
      }
    });

    return await UserService.getUserDetail(targetUserId);
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
