// lib/utils/cycle.ts
import { CycleStatus } from "@/lib/types/cycle"

export function getStatusColor(status: CycleStatus): string {
  switch (status) {
    case "active":
      return "bg-green-500"
    case "completed":
      return "bg-blue-500"
    case "pending":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}