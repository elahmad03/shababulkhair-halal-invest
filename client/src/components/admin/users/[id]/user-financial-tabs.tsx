// /components/admin/users/[id]/user-financials-tabs.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { ShareholderInvestment, Transaction, WithdrawalRequest } from "@/schemas/app";

type FinancialsProps = {
    investments: (ShareholderInvestment & { cycleName: string })[];
    transactions: Transaction[];
    withdrawals: WithdrawalRequest[];
}

export function UserFinancialsTabs({ investments, transactions, withdrawals }: FinancialsProps) {
    return (
        <Tabs defaultValue="investments">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="investments">Investments</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
            <TabsContent value="investments">
                <Card>
                    <CardHeader><CardTitle>Investment History</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Cycle</TableHead><TableHead>Amount</TableHead><TableHead>Profit</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {investments.map(inv => (
                                    <TableRow key={inv.id}>
                                        <TableCell>{inv.cycleName}</TableCell>
                                        <TableCell>{formatCurrency(inv.amountInvested)}</TableCell>
                                        <TableCell>{formatCurrency(inv.profitEarned)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            {/* Implement other tabs similarly */}
        </Tabs>
    )
}