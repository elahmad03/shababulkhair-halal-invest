import { CheckCircle, Circle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TimelineEvent {
  label: string
  date: Date | null
  completed: boolean
  icon?: "check" | "money"
}

interface InvestmentTimelineProps {
  events: TimelineEvent[]
}

const InvestmentTimeline = ({ events }: InvestmentTimelineProps) => {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex gap-4">
          {/* Timeline Line */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                event.completed
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400"
              )}
            >
              {event.icon === "money" ? (
                <span className="text-xl">💰</span>
              ) : event.completed ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            {index < events.length - 1 && (
              <div
                className={cn(
                  "w-0.5 flex-1 min-h-[40px]",
                  event.completed
                    ? "bg-emerald-500"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
          </div>

          {/* Event Details */}
          <div className="flex-1 pb-8">
            <h4
              className={cn(
                "font-semibold mb-1",
                event.completed
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {event.label}
            </h4>
            {event.date && (
              <p className="text-sm text-muted-foreground">
                {format(event.date, "MMMM dd, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default InvestmentTimeline