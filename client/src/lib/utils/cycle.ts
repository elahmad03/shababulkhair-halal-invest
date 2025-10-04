// lib/utils/cycle.ts
import { CycleStatus } from "@/lib/types/cycle"

export function getStatusColor(status: CycleStatus): string {
  switch (status) {
    case "Active":
      return "bg-green-500"
    case "Completed":
      return "bg-blue-500"
    case "Pending":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}