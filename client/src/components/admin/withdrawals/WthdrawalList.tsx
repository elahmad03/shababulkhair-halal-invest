import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PendingWithdrawal } from "@/app/admin/withdrawals/page";
import { AdminWithdrawalActions } from "./WithdrawalsActions";

interface AdminWithdrawalListProps {
  data: PendingWithdrawal[];
  onAction: (requestId: number) => void;
}

const formatType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function AdminWithdrawalList({ data, onAction }: AdminWithdrawalListProps) {
  return (
    <div className="flex flex-col gap-4">
      {data.map((request) => (
        <Card key={request.id} className="w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-2xl font-bold">
                        {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                        }).format(request.amount)}
                    </CardTitle>
                    <CardDescription className="font-medium">{request.user.fullName}</CardDescription>
                </div>
                <Badge variant="outline">{formatType(request.withdrawalType)}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Requested on{" "}
              <strong>
                {new Date(request.requestedAt).toLocaleDateString("en-US", {
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </strong>
            </div>
          </CardContent>
          <CardFooter>
            <AdminWithdrawalActions requestId={request.id} onAction={onAction} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}