import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";

// Use these everywhere instead of plain useDispatch/useSelector
// Gives you full TypeScript inference throughout the app
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();