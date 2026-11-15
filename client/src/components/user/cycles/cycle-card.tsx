import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CycleCardProps {
  title: string;
  status: "OPEN_FOR_INVESTMENT" | "ACTIVE";
  details: {
    label: string;
    value: string;
  }[];
  buttonText: string;
  buttonVariant?: "default" | "outline" | "secondary";
  onButtonClick: () => void;
}

export function CycleCard({
  title,
  status,
  details,
  buttonText,
  buttonVariant = "default",
  onButtonClick,
}: CycleCardProps) {
  const statusConfig = {
    OPEN_FOR_INVESTMENT: {
      label: "Open for Investment",
      variant: "default" as const,
    },
    ACTIVE: {
      label: "Active",
      variant: "secondary" as const,
    },
  };

  return (
    <Card className="flex flex-col h-full bg-card text-card-foreground">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <Badge variant={statusConfig[status].variant}>
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          {details.map((detail, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{detail.label}:</span>
              <span className="font-semibold text-foreground">{detail.value}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={buttonVariant}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
