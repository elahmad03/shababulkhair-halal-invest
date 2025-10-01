import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CycleCardProps {
  title: string;
  status: 'open_for_investment' | 'active';
  details: {
    label: string;
    value: string;
  }[];
  buttonText: string;
  buttonVariant?: 'default' | 'outline';
  onButtonClick: () => void;
}

export function CycleCard({
  title,
  status,
  details,
  buttonText,
  buttonVariant = 'default',
  onButtonClick,
}: CycleCardProps) {
  const statusConfig = {
    open_for_investment: {
      label: 'Open for Investment',
      className: 'bg-green-500 hover:bg-green-600 text-white',
    },
    active: {
      label: 'Active',
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <Badge className={statusConfig[status].className}>
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          {details.map((detail, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{detail.label}:</span>
              <span className="font-semibold">{detail.value}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className={buttonVariant === 'default' ? 'w-full bg-green-500 hover:bg-green-600' : 'w-full'}
          variant={buttonVariant}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}