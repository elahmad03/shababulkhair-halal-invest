
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ArrowUp } from 'lucide-react';
import Link from 'next/link';

export const WalletActions = () => {
  return (
    <Card className="shadow-lg border-none">
      <CardContent className="p-4 md:p-6 grid grid-cols-2 gap-3 md:gap-4">
        
        {/* Deposit Button (Primary Action - Emerald/Green) */}
        <Button 
          asChild
          className="w-full h-12 md:h-16 text-sm md:text-lg font-semibold 
                     bg-emerald-600 hover:bg-emerald-700 
                     dark:bg-emerald-500 dark:hover:bg-emerald-600 
                     text-white
                     transition-all duration-300 transform hover:scale-[1.02] shadow-md"
        >
          <Link href="wallet/deposit">
            <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
            <span className="hidden sm:inline">Add Funds</span>
            <span className="sm:hidden">Deposit</span>
          </Link>
        </Button>
        
        {/* Withdrawal Button (Secondary Action - Outline) */}
        <Button 
          asChild
          variant="outline" 
          className="w-full h-12 md:h-16 text-sm md:text-lg font-semibold 
                     border-emerald-600 text-emerald-700 
                     dark:border-emerald-500 dark:text-emerald-500 
                     hover:bg-emerald-50 dark:hover:bg-gray-800
                     transition-all duration-300 transform hover:scale-[1.02] shadow-sm"
        >
          <Link href="wallet/withdraw">
            <ArrowUp className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
            <span className="hidden sm:inline">Request Withdrawal</span>
            <span className="sm:hidden">Withdraw</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};