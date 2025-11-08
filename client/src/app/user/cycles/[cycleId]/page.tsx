import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CycleSummaryCard from "@/components/user/cycles/cycleDetails/CycleSummaryCard"
import StickyInvestmentBar from "@/components/user/cycles/cycleDetails/StickyInvestmentbar"
import FloatingInvestmentFooter from "@/components/user/cycles/cycleDetails/FloatingInvestmentFooter"
import { mockInvestmentCycles } from "@/db"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar, Clock, Target, TrendingUp, Briefcase, Shield, DollarSign } from "lucide-react"

interface CycleDetailsPageProps {
  params: {
    cycleId: string
  }
}

const CycleDetailsPage =async ({ params }: CycleDetailsPageProps) => {
   const { cycleId } = await params
  const cycleIdNum = parseInt(cycleId)
  
  const cycle = mockInvestmentCycles.find((c) => c.id === cycleIdNum)

  if (!cycle) {
    notFound()
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open_for_investment":
        return { label: "Open for Investment", color: "bg-emerald-500" }
      case "active":
        return { label: "Active", color: "bg-blue-500" }
      case "completed":
        return { label: "Completed", color: "bg-gray-500" }
      default:
        return { label: "Pending", color: "bg-gray-400" }
    }
  }

  const statusConfig = getStatusConfig(cycle.status)

  return (
    <>
      <StickyInvestmentBar cycle={cycle} />
      
      <div className="min-h-screen pb-24 lg:pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Desktop Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Hero Section */}
              <Card className="border-2">
                <CardHeader className="space-y-4">
                  <Badge className={`${statusConfig.color} text-white w-fit`}>
                    {statusConfig.label}
                  </Badge>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                      {cycle.name}
                    </h1>
                    <p className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {formatCurrency(cycle.pricePerShare)} per share
                    </p>
                  </div>
                </CardHeader>
              </Card>

              {/* The Offer - Key Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">The Offer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Investment Window</p>
                        <p className="font-semibold">
                          {cycle.startDate && format(new Date(cycle.startDate), "MMM dd")} - {cycle.endDate && format(new Date(cycle.endDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold">30 Days</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                        <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Maturity Date</p>
                        <p className="font-semibold">
                          {cycle.endDate && format(new Date(cycle.endDate), "MMMM dd, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Projected Allocation</p>
                        <p className="font-semibold">Import/Export Ventures</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Investment Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base leading-relaxed">
                    Funds from this cycle will be primarily allocated to our high-yield electronics import business ahead of the holiday season. Our committee has identified strategic opportunities in the smartphone accessories and consumer electronics markets, which historically show strong demand during this period.
                  </p>
                  <p className="text-base leading-relaxed">
                    This cycle represents a carefully curated portfolio of ventures managed by our experienced committee members, each bringing specialized knowledge in their respective sectors. We maintain strict due diligence on all business allocations to ensure your investment is handled with the utmost care and professional oversight.
                  </p>
                  <p className="text-base leading-relaxed">
                    All profits generated during this cycle will be distributed according to our transparent 80/20 split model, with 80% going directly to our investors and 20% supporting organizational operations and growth.
                  </p>
                </CardContent>
              </Card>

              {/* How It Works */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Purchase Shares</h4>
                        <p className="text-sm text-muted-foreground">
                          Invest during the open window by purchasing shares at the fixed price of {formatCurrency(cycle.pricePerShare)} per share.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Capital Deployment</h4>
                        <p className="text-sm text-muted-foreground">
                          Our committee allocates the pooled capital to vetted business ventures across various profitable sectors.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Profit Distribution</h4>
                        <p className="text-sm text-muted-foreground">
                          At the end of the cycle, your proportional share of the 80% investor profit pool is credited to your wallet.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Disclosure */}
              <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-xl">Important Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    • All investments carry inherent risks. Past performance does not guarantee future results.
                  </p>
                  <p>
                    • Your capital is deployed in real business ventures which may experience varying levels of success.
                  </p>
                  <p>
                    • Profit distributions are based on actual business performance and may vary from projections.
                  </p>
                  <p>
                    • Please invest only amounts you can afford to allocate for the full cycle duration.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sticky Summary (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="sticky top-6">
                <CycleSummaryCard cycle={cycle} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Summary Card */}
      <div className="lg:hidden container mx-auto px-4 pb-6">
        <CycleSummaryCard cycle={cycle} />
      </div>

      <FloatingInvestmentFooter cycle={cycle} />
    </>
  )
}

export default CycleDetailsPage