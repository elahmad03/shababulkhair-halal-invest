// src/components/ui/Stepper.tsx

import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have shadcn's utility function

// --- TYPES ---
export type StepStatus = 'complete' | 'active' | 'pending';

interface StepItemProps {
  label: string;
  icon: React.ReactNode;
  status: StepStatus;
  index: number;
  isLast: boolean;
}

interface StepperProps {
  currentStep: number;
  steps: { label: string; icon: React.ReactNode }[];
  className?: string;
}

// --- 1. StepItem Component ---
const StepItem: React.FC<StepItemProps> = ({ label, icon, status, isLast, index }) => {
  // Define colors based on status and Ember Green theme
  const iconBg = {
    complete: 'bg-ember-green-700 dark:bg-ember-green-500 text-white',
    active: 'bg-ember-green-100 dark:bg-ember-green-900 text-ember-green-700 dark:text-ember-green-500 ring-4 ring-ember-green-200 dark:ring-ember-green-700',
    pending: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600',
  };

  const labelClasses = {
    complete: 'text-ember-green-700 dark:text-ember-green-500 font-medium',
    active: 'text-gray-900 dark:text-gray-50 font-semibold',
    pending: 'text-gray-500 dark:text-gray-400',
  };

  const connectorClasses = {
    complete: 'bg-ember-green-700 dark:bg-ember-green-500',
    active: 'bg-ember-green-200 dark:bg-gray-700',
    pending: 'bg-gray-200 dark:bg-gray-700',
  };

  const IconDisplay = (
    <div className={cn(
      'w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 z-10',
      iconBg[status]
    )}>
      {status === 'complete' ? (
        <Check className="h-5 w-5" />
      ) : status === 'active' ? (
        <Loader2 className="h-5 w-5 animate-spin" /> // Using Loader2 to indicate 'in progress'
      ) : (
        icon
      )}
    </div>
  );

  return (
    <div className="flex items-center flex-1">
      {/* Icon and Label */}
      <div className="flex flex-col items-center min-w-[70px]">
        {IconDisplay}
        <span className={cn('mt-2 text-xs text-center transition-colors', labelClasses[status])}>
          {label}
        </span>
      </div>

      {/* Connector Line (Hidden on the last step) */}
      {!isLast && (
        <div className={cn(
          'flex-1 h-0.5 mx-2 md:mx-4 transition-colors duration-300',
          connectorClasses[status]
        )} />
      )}
    </div>
  );
};

// --- 2. Stepper Component ---
export const Stepper: React.FC<StepperProps> = ({ currentStep, steps, className }) => {
  return (
    <div className={cn('flex justify-between w-full overflow-x-auto p-2', className)}>
      {steps.map((step, index) => {
        const stepIndex = index + 1;
        
        let status: StepStatus;
        if (stepIndex < currentStep) {
          status = 'complete';
        } else if (stepIndex === currentStep) {
          status = 'active';
        } else {
          status = 'pending';
        }

        return (
          <StepItem
            key={index}
            label={step.label}
            icon={step.icon}
            status={status}
            index={index}
            isLast={index === steps.length - 1}
          />
        );
      })}
    </div>
  );
};