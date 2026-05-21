import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { useGetVenturesByCycleQuery, useUpdateVentureMutation } from "@/store/modules/venture/ventureApi";
// Use these everywhere instead of plain useDispatch/useSelector
// Gives you full TypeScript inference throughout the app
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// ─── Re-export all API hooks for centralized imports ──────────────────────────

// Auth API hooks
export * from "@/store/modules/auth/authApi";

// Cycle API hooks
export * from "@/store/modules/cycle/cycleApi";

// Ledger API hooks
export * from "@/store/modules/ledger/ledgerApi";

// KYC API hooks
export * from "@/store/modules/kyc/kycApi";

// Note: Venture-specific hooks use separate naming to avoid conflicts with cycleApi
// Import directly from ventureApi if needed:
