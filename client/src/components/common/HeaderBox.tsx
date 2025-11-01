import { Card, CardContent } from "@/components/ui/card"

interface HeaderBoxProps {
  type?: "title" | "greeting"
  title: string
  subtext?: string
  user?: string
}

const HeaderBox = ({ type = "title", title, subtext, user }: HeaderBoxProps) => {
  return (
    <div className="border-0 shadow-none bg-transparent">
      <div className="p-0">
        <h1 className="text-2xl font-bold tracking-tight">
          {title}
          {type === "greeting" && (
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              &nbsp;{user}
            </span>
          )}
        </h1>
        {subtext && (
          <p className="text-muted-foreground text-sm mt-1">{subtext}</p>
        )}
      </div>
    </div>
  )
}

export default HeaderBox
