'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchWalletBalance,
  fetchCryptoWallet,
  fetchFullWalletInfo,
  clearWalletError,
  createVirtualAccount,
} from '@/store/slice/walletSlice';
import { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Eye, EyeOff, ArrowUpRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import WalletFundingCard from './walletFunding';
import TotalBalanceBox from '@/components/TotalBalanceBox';

export default function WalletPage() {
  const dispatch = useDispatch();
  const {
    balance,
    tier,
    cryptoWallet,
    fullWallet,
    fundingStatus,
    verifyStatus,
    error,
  } = useSelector((state: RootState) => state.wallet);
  
  const [showBalance, setShowBalance] = useState(false);
  const [fundAmount, setFundAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState<'monnify' | 'paystack'>('paystack');
  const [verificationRef, setVerificationRef] = useState('');

  // Fetch wallet data on mount
  useEffect(() => {
    dispatch(fetchWalletBalance() as any);
    dispatch(fetchCryptoWallet() as any);
    dispatch(fetchFullWalletInfo() as any);
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearWalletError());
    }
  }, [error, dispatch]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const transactions = fullWallet?.walletTransaction || [];
  const [tab, setTab] = useState<'wallet' | 'crypto'>('wallet');
  const [virtualAccount, setVirtualAccount] = useState<any>(null);
  const [vaLoading, setVaLoading] = useState(false);
  const [vaError, setVaError] = useState<string | null>(null);

  // Fetch virtual account info from wallet (if present)
  useEffect(() => {
    if (fullWallet && fullWallet.internalWalletId && fullWallet.bankName) {
      setVirtualAccount({
        accountNumber: fullWallet.internalWalletId,
        bankName: fullWallet.bankName,
      });
    }
  }, [fullWallet]);

  const handleCreateVirtualAccount = async () => {
    setVaLoading(true);
    setVaError(null);
    try {
      const res = await dispatch(createVirtualAccount() as any).unwrap();
      setVirtualAccount({
        accountNumber: res.data.account_number,
        bankName: res.data.bank_name,
      });
      toast.success('Virtual account created!');
    } catch (err: any) {
      setVaError(err || 'Failed to create virtual account');
    } finally {
      setVaLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8">
        {/* Total Balance Box */}
        <TotalBalanceBox 
          totalCurrentBalance={balance || 0} 
          accounts={fullWallet?.accounts || []}
          totalBanks={fullWallet?.totalBanks || 0}
        />

        {/* Tabs for Wallet and Crypto */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
          </TabsList>
          {/* Wallet Tab */}
          <TabsContent value="wallet">
            {/* Virtual Account Box */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-100 via-lime-100 to-yellow-50 mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Virtual Account</span>
                </CardTitle>
                <CardDescription>
                  Fund your wallet by transferring to your unique virtual account below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {virtualAccount ? (
                  <div className="flex flex-col gap-2 items-center">
                    <div className="text-lg font-semibold text-green-700">{virtualAccount.bankName}</div>
                    <div className="text-2xl font-mono font-bold text-lime-700 tracking-widest">{virtualAccount.accountNumber}</div>
                    <div className="text-xs text-muted-foreground">Account Name: Your Registered Name</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      onClick={handleCreateVirtualAccount}
                      disabled={vaLoading}
                      className="w-full bg-gradient-to-r from-green-500 via-lime-500 to-yellow-500 text-white font-semibold shadow hover:brightness-110 transition-all duration-300 ease-in-out"
                    >
                      {vaLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Virtual Account'}
                    </Button>
                    {vaError && <div className="text-red-600 text-xs mt-2">{vaError}</div>}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Wallet Balance Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-100 via-lime-100 to-yellow-50 mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Wallet Balance</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </CardTitle>
                <CardDescription>Your current available balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">
                  {showBalance ? balance : '•••••••'}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Tier Status</span>
                      <span>{tier || 'Loading...'}</span>
                    </div>
                    <Progress value={tier === 'Gold' ? 100 : tier === 'Silver' ? 65 : 30} className="h-2" />
                  </div>
                  <Button variant="outline" size="sm" className="bg-white">
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
            <WalletFundingCard />
            {/* Transaction History */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent wallet transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx: any) => (
                        <TableRow key={tx.reference}>
                          <TableCell>
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="capitalize">{tx.type}</TableCell>
                          <TableCell className={tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {tx.status === 'success' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="capitalize">{tx.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{tx.reference}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Crypto Tab */}
          <TabsContent value="crypto">
            {cryptoWallet ? (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Crypto Wallet</CardTitle>
                  <CardDescription>Your blockchain wallet address</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="font-mono text-sm">{cryptoWallet.address}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Network</div>
                      <div className="text-sm font-medium">{cryptoWallet.network}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="bg-gradient-to-r from-gray-100 to-gray-200">
                    View on Explorer <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No crypto wallet found
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}