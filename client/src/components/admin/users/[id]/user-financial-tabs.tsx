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
};

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
                    <CardHeader>
                        <CardTitle>Investment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto w-full">
                            <div className="min-w-full">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cycle Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Amount Invested</TableHead>
                                            <TableHead>Profit Earned</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {investments.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell>{inv.cycleName}</TableCell>
                                                <TableCell>{(inv as any).status ?? 'N/A'}</TableCell>
                                                <TableCell>{formatCurrency((inv as any).amountInvested)}</TableCell>
                                                <TableCell>{formatCurrency((inv as any).profitEarned ?? 0)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="transactions">
                <Card>
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto w-full">
                            <div className="min-w-full">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell>{new Date((t as any).createdAt).toLocaleString()}</TableCell>
                                                <TableCell className="capitalize">{t.type}</TableCell>
                                                <TableCell>{t.description}</TableCell>
                                                <TableCell>{formatCurrency((t as any).amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="withdrawals">
                <Card>
                    <CardHeader>
                        <CardTitle>Withdrawals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto w-full">
                            <div className="min-w-full">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {withdrawals.map((w) => (
                                            <TableRow key={w.id}>
                                                <TableCell>{new Date((w as any).requestedAt).toLocaleString()}</TableCell>
                                                <TableCell>{formatCurrency((w as any).amount)}</TableCell>
                                                <TableCell className="capitalize">{(w as any).withdrawalType}</TableCell>
                                                <TableCell className="capitalize">{w.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}