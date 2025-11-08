"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { generateInvestmentReceiptPDF } from "@/lib/utils/Pdfgenerator"
import type { ShareholderInvestment, InvestmentCycle, User } from "@/db/types"

interface DownloadReceiptButtonProps {
  investment: ShareholderInvestment
  cycle: InvestmentCycle
  user: User
  pricePerShare: bigint
}

const DownloadReceiptButton = ({
  investment,
  cycle,
  user,
  pricePerShare,
}: DownloadReceiptButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      await generateInvestmentReceiptPDF({
        investmentId: investment.id,
        cycleName: cycle.name,
        cycleStatus: cycle.status ?? "",
        userName: user.fullName,
        shares: investment.shares,
        pricePerShare,
        amountInvested: investment.amountInvested,
        profitEarned: investment.profitEarned ?? 0n,
        investedAt: investment.createdAt,
        cycleStartDate: cycle.startDate,
        cycleEndDate: cycle.endDate,
      })
      toast.success("Receipt Downloaded", {
        description: "Your investment receipt has been saved as PDF",
      })
    } catch (error) {
      toast.error("Download Failed", {
        description: "Unable to generate PDF. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 w-full sm:w-auto"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download Receipt
        </>
      )}
    </Button>
  )
}

export default DownloadReceiptButton