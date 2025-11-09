
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Link href="/admin/cycles">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cycles
        </Button>
      </Link>
      <h2 className="text-2xl font-bold mb-4">Cycle Not Found</h2>
      <p className="text-muted-foreground">
        The cycle you're looking for doesn't exist or has been removed.
      </p>
    </div>
  )
}