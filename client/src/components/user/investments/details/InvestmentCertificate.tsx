import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Award, TrendingUp } from "lucide-react"

interface InvestmentCertificateProps {
  cycleName: string
  cycleStatus: string
  shares: number
  pricePerShare: bigint
  amountInvested: bigint
  profitEarned: bigint
  investedAt: Date
}

const InvestmentCertificate = ({
  cycleName,
  cycleStatus,
  shares,
  pricePerShare,
  amountInvested,
  profitEarned,
  investedAt,
}: InvestmentCertificateProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Active", color: "bg-blue-500" }
      case "completed":
        return { label: "Completed", color: "bg-green-500" }
      default:
        return { label: "Pending", color: "bg-gray-400" }
    }
  }

  const statusConfig = getStatusConfig(cycleStatus)
  const isCompleted = cycleStatus === "completed"
  const totalReturn = amountInvested + profitEarned

  return (
    <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20 shadow-lg">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Investment Certificate</p>
              <h2 className="text-2xl sm:text-3xl font-bold">{cycleName}</h2>
            </div>
          </div>
          <Badge className={`${statusConfig.color} text-white`}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />
        
        {/* Investment Details Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Principal Amount</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(amountInvested)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Shares Owned</p>
            <p className="text-2xl font-bold">{shares}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Price Per Share</p>
            <p className="text-xl font-semibold">{formatCurrency(pricePerShare)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Investment Date</p>
            <p className="text-xl font-semibold">{format(investedAt, "MMM dd, yyyy")}</p>
          </div>
        </div>

        {/* Performance Section */}
        {isCompleted && profitEarned > 0n && (
          <>
            <Separator />
            <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                  Investment Performance
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Net Profit</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    +{formatCurrency(profitEarned)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Return</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(totalReturn)}
                  </span>
                </div>
                <div className="pt-2 border-t border-green-200 dark:border-green-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ROI</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {((Number(profitEarned) / Number(amountInvested)) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default InvestmentCertificate