"use client";

import { useState } from "react";
import { motion } from "framer-motion"; // Or generic framer-motion
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, Lock } from "lucide-react";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawalModal";

interface WalletOverviewProps {
  balanceKobo: string;
  lockedBalanceKobo: string;
}

export default function WalletOverview({ balanceKobo, lockedBalanceKobo }: WalletOverviewProps) {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Convert Kobo to Naira for display
  const availableNaira = Number(balanceKobo) / 100;
  const lockedNaira = Number(lockedBalanceKobo) / 100;

  return (
    <>
      <Card className="shadow-md border-border/50 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-10 -top-10 h-32 w-32 bg-primary/10 rounded-full blur-3xl" />
        
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Available Balance
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tighter"
          >
            ₦{availableNaira.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </motion.div>

          {lockedNaira > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md w-max"
            >
              <Lock className="w-3 h-3 mr-1.5" />
              ₦{lockedNaira.toLocaleString("en-NG")} pending withdrawal
            </motion.div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Button 
              className="w-full" 
              onClick={() => setIsDepositOpen(true)}
            >
              <ArrowDownToLine className="w-4 h-4 mr-2" />
              Deposit
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsWithdrawOpen(true)}
              disabled={availableNaira <= 0}
            >
              <ArrowUpFromLine className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <DepositModal open={isDepositOpen} onOpenChange={setIsDepositOpen} />
      <WithdrawModal 
        open={isWithdrawOpen} 
        onOpenChange={setIsWithdrawOpen} 
        maxAmount={availableNaira} 
      />
    </>
  );
}