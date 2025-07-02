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
import WalletFundingCard from './walletFunding';

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
              {showBalance ?balance : '•••••••'}
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
<WalletFundingCard/>
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