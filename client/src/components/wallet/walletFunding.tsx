'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  fetchWalletBalance,
  initializeMonnifyFunding,
  initializePaystackFunding,
  verifyMonnifyFunding,
  verifyPaystackFunding,
  clearWalletError,
} from '@/src/store/slice/walletSlice';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Loader2 } from 'lucide-react';

const WalletFundingCard = () => {
  const dispatch = useAppDispatch();
  const {
    balance,
    tier,
    error,
    fundingStatus,
    verifyStatus,
  } = useAppSelector((state) => state.wallet);

  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState<'monnify' | 'paystack'>('monnify');
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchWalletBalance());
  }, [dispatch]);

  useEffect(() => {
    if (!paymentRef) return;

    const interval = setInterval(() => {
      if (provider === 'monnify') {
        dispatch(verifyMonnifyFunding(paymentRef))
          .unwrap()
          .then((res) => {
            setSuccessMessage(
              `₦${res.transaction.amount.toLocaleString()} successfully funded!`
            );
            dispatch(fetchWalletBalance());
            clearInterval(interval);
          })
          .catch(() => {});
      } else {
        dispatch(verifyPaystackFunding(paymentRef))
          .unwrap()
          .then((res) => {
            setSuccessMessage(
              `₦${res.transaction.amount.toLocaleString()} successfully funded!`
            );
            dispatch(fetchWalletBalance());
            clearInterval(interval);
          })
          .catch(() => {});
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch, paymentRef, provider]);

  const handleFund = async () => {
    if (!amount || isNaN(+amount) || +amount < 100) {
      alert('Enter a valid amount (min ₦100)');
      return;
    }

    dispatch(clearWalletError());
    setSuccessMessage(null);

    try {
      if (provider === 'monnify') {
        const res = await dispatch(initializeMonnifyFunding(+amount)).unwrap();
        window.open(res.checkoutUrl, '_blank');
        setPaymentRef(res.paymentReference);
      } else {
        const res = await dispatch(initializePaystackFunding(+amount)).unwrap();
        window.open(res.checkoutUrl, '_blank');
        setPaymentRef(res.paymentReference);
      }
    } catch (err) {
      console.error('Funding error:', err);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10 p-6 shadow-xl border border-muted">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Wallet Balance</h2>
        <div className="text-center text-3xl font-bold text-green-600">
          ₦{balance?.toLocaleString() || '0.00'}
        </div>
        <div className="text-center text-xs text-muted-foreground">
          Tier: {tier || 'N/A'}
        </div>

        {/* Provider Switcher */}
        <div className="flex justify-center gap-3 mt-4">
          <Button
            variant={provider === 'monnify' ? 'default' : 'outline'}
            onClick={() => setProvider('monnify')}
          >
            Monnify
          </Button>
          <Button
            variant={provider === 'paystack' ? 'default' : 'outline'}
            onClick={() => setProvider('paystack')}
          >
            Paystack
          </Button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Enter Amount</label>
          <Input
            type="number"
            placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Fund Button */}
        <Button
          onClick={handleFund}
          disabled={fundingStatus === 'loading'}
          className="w-full bg-gradient-to-r from-green-500 via-lime-500 to-yellow-500 text-white font-semibold shadow hover:brightness-110 transition-all duration-300 ease-in-out"
        >
          {fundingStatus === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Initializing...
            </>
          ) : (
            `Fund with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`
          )}
        </Button>

        {/* Payment Reference */}
        {paymentRef && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            Payment Ref: <code>{paymentRef}</code>
            <br />
            <span className="text-xs">Verifying every 10s...</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 p-3 rounded border text-green-700 bg-green-50 text-sm">
            ✅ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 rounded border text-red-600 bg-red-50 text-sm">
            ❌ {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletFundingCard;
