import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import InvestmentCertificate from "@/components/user/investments/details/InvestmentCertificate"
import InvestmentTimeline from "@/components/user/investments/details/Investmenttimeline"
import DownloadReceiptButton from "@/components/user/investments/details/DownloadButtonReceipt"
import { 
  mockShareholderInvestments, 
  mockInvestmentCycles,
  mockUsers 
} from "@/db"

interface InvestmentDetailsPageProps {
  params: Promise<{
    investmentId: string
  }>
}

const InvestmentDetailsPage = async ({ params }: InvestmentDetailsPageProps) => {
  const { investmentId } = await params
  const investmentIdNum = parseInt(investmentId)
  
  const investment = mockShareholderInvestments.find(
    (inv) => inv.id === investmentIdNum
  )

  if (!investment) {
    notFound()
  }

  const cycle = mockInvestmentCycles.find((c) => c.id === investment.cycleId)
  const user = mockUsers.find((u) => u.id === investment.userId)

  if (!cycle || !user) {
    notFound()
  }

  const isCompleted = cycle.status === "completed"
  const isActive = cycle.status === "active"

  // Build timeline events
  type TimelineEvent = {
    label: string
    date: Date | null
    completed: boolean
    icon?: "money"
  }

  const timelineEvents: TimelineEvent[] = [
    {
      label: "Investment Confirmed",
      date: investment.createdAt,
      completed: true,
    },
    {
      label: "Cycle Became Active",
      date: cycle.startDate ? new Date(cycle.startDate) : null,
      completed: isActive || isCompleted,
    },
    {
      label: "Cycle Completed",
      date: cycle.endDate ? new Date(cycle.endDate) : null,
      completed: isCompleted,
    },
  ]

  if (isCompleted && (investment.profitEarned ?? 0n) > 0n) {
    timelineEvents.push({
      label: "Profit Distributed",
      date: cycle.endDate ? new Date(new Date(cycle.endDate).getTime() + 86400000) : null, // +1 day
      completed: true,
      icon: "money",
    })
  }

  const pricePerShare = investment.amountInvested / BigInt(investment.shares)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 to-green-50/30 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1200px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/user/investments">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Button>
            </Link>
          </div>
          <DownloadReceiptButton
            investment={investment}
            cycle={cycle}
            user={user}
            pricePerShare={pricePerShare}
          />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Investment #{investment.id}
          </h1>
          <p className="text-muted-foreground">
            Official investment certificate and transaction record
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Certificate */}
          <div className="lg:col-span-7 space-y-6">
            <InvestmentCertificate
              cycleName={cycle.name}
              cycleStatus={cycle.status ?? "unknown"}
              shares={investment.shares}
              pricePerShare={pricePerShare}
              amountInvested={investment.amountInvested}
              profitEarned={investment.profitEarned ?? 0n}
              investedAt={investment.createdAt}
            />

            {/* Additional Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">About This Investment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground leading-relaxed">
                  This investment represents your participation in the {cycle.name}. 
                  Your capital was pooled with other investors and deployed across 
                  vetted business ventures managed by our committee members.
                </p>
                {isCompleted && (
                  <p className="text-muted-foreground leading-relaxed">
                    The cycle has been completed and profits have been distributed 
                    according to the 80/20 split model, with 80% going to investors.
                  </p>
                )}
                {isActive && (
                  <p className="text-muted-foreground leading-relaxed">
                    This cycle is currently active. Your investment is being deployed 
                    in business ventures. Profit distribution will occur once the cycle 
                    reaches maturity.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-5">
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="text-xl">Investment Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <InvestmentTimeline events={timelineEvents} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvestmentDetailsPage