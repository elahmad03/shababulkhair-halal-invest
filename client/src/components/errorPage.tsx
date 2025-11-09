
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Import Link from next/link
import { AlertTriangle } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="flex flex-col items-center gap-2">
          <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
          <CardTitle className="text-center text-2xl font-bold">Something went wrong</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sorry, an unexpected error has occurred or this page does not exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Use Next.js Link component for navigation */}
          <Link href="/" passHref>
            <Button variant="default" size="lg">Go Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}