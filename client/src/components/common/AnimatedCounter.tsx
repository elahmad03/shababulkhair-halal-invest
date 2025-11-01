'use client';

import CountUp from 'react-countup';
import { koboToNgn } from '@/lib/utils';

const AnimatedCounter = ({ amount }: { amount: number | bigint }) => {
  const endValue = typeof amount === 'bigint' ? koboToNgn(amount) : amount;
  return (
    <div className="w-full">
      <CountUp 
        decimals={2}
        decimal=","
        prefix="₦"
        end={endValue} 
      />
    </div>
  )
}

export default AnimatedCounter