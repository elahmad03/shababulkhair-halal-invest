'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  fetchWalletBalance,
  fetchCryptoWallet,
  fetchFullWalletInfo,
  initializeMonnifyFunding,
  initializePaystackFunding,
  verifyMonnifyFunding,
  verifyPaystackFunding,
  clearWalletError,
} from '@/store/slice/walletSlice';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Eye, EyeOff, ArrowUpRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

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

  const handleFundWallet = () => {
    if (fundAmount < 100) {
      toast.error('Minimum funding amount is ₦100');
      return;
    }

    if (paymentMethod === 'monnify') {
      dispatch(initializeMonnifyFunding(fundAmount) as any);
    } else {
      dispatch(initializePaystackFunding(fundAmount) as any);
    }
  };

  const handleVerifyPayment = () => {
    if (!verificationRef) {
      toast.error('Please enter a reference');
      return;
    }

    if (paymentMethod === 'monnify') {
      dispatch(verifyMonnifyFunding(verificationRef) as any);
    } else {
      dispatch(verifyPaystackFunding(verificationRef) as any);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const transactions = fullWallet?.transactions || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8">
        {/* Wallet Overview */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
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
              {showBalance ? formatCurrency(balance) : '•••••••'}
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

        {/* Wallet Actions */}
        <Tabs defaultValue="fund" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fund">Fund Wallet</TabsTrigger>
            <TabsTrigger value="verify">Verify Payment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fund">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Fund Your Wallet</CardTitle>
                <CardDescription>Add money to your wallet using any payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(Number(e.target.value))}
                    min="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={paymentMethod === 'paystack' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('paystack')}
                      className={`w-full ${paymentMethod === 'paystack' ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white' : ''}`}
                    >
                      Paystack
                    </Button>
                    <Button
                      variant={paymentMethod === 'monnify' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('monnify')}
                      className={`w-full ${paymentMethod === 'monnify' ? 'bg-gradient-to-r from-green-600 to-teal-500 text-white' : ''}`}
                    >
                      Monnify
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleFundWallet}
                  disabled={fundingStatus === 'loading'}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  {fundingStatus === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="verify">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Verify Payment</CardTitle>
                <CardDescription>Verify your payment if you've already made one</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={paymentMethod === 'paystack' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('paystack')}
                      className={`w-full ${paymentMethod === 'paystack' ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white' : ''}`}
                    >
                      Paystack
                    </Button>
                    <Button
                      variant={paymentMethod === 'monnify' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('monnify')}
                      className={`w-full ${paymentMethod === 'monnify' ? 'bg-gradient-to-r from-green-600 to-teal-500 text-white' : ''}`}
                    >
                      Monnify
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference">Payment Reference</Label>
                  <Input
                    id="reference"
                    placeholder="Enter your payment reference"
                    value={verificationRef}
                    onChange={(e) => setVerificationRef(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleVerifyPayment}
                  disabled={verifyStatus === 'verifying'}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  {verifyStatus === 'verifying' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Payment'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Crypto Wallet */}
        {cryptoWallet && (
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
        )}

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
      </div>
    </div>
  );
}