"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { generateInvestmentReceiptPDF } from "@/lib/utils/Pdfgenerator"
import type { ShareholderInvestment, Cycle } from "@/store/modules/cycle/cycle.types"

interface UserProfileSimple {
  fullName: string;
}

interface DownloadReceiptButtonProps {
  investment: ShareholderInvestment
  cycle: Cycle
  user: UserProfileSimple
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
        cycleName: cycle.cycleName,
        cycleStatus: String(cycle.status ?? ""),
        userName: user.fullName,
        shares: BigInt(investment.sharesAllocated || "0"),
        pricePerShare,
        amountInvested: BigInt(investment.amountInvestedKobo || "0"),
        profitEarned: BigInt(investment.profitEarnedKobo || "0"),
        investedAt: new Date(investment.createdAt),
        cycleStartDate: cycle.fundingOpensAt ? new Date(cycle.fundingOpensAt) : null,
        cycleEndDate: cycle.activeEndsAt ? new Date(cycle.activeEndsAt) : null,
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