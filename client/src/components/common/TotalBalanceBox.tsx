import { Card, CardContent } from "@/components/ui/card"
import AnimatedCounter from "./AnimatedCounter"

interface TotalBalanceBoxProps {
  totalCurrentBalance?: number
}

const TotalBalanceBox = ({
  totalCurrentBalance = 1234.56,
}: TotalBalanceBoxProps) => {
  return (
    <Card className="w-full border-0 shadow-md rounded-2xl">
      <CardContent className="p-6 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Total Current Balance
        </p>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold tracking-tight">
            <AnimatedCounter amount={totalCurrentBalance} />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default TotalBalanceBox
