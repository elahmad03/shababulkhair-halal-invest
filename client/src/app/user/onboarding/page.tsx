
import { Stepper } from '@/components/ui/stepper'; // Import the new component
import { User, Shield, Lock, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProfileSetupForm } from '@/components/onboarding/ProfileForm';

// Define the steps for the onboarding flow
const onboardingSteps = [
    { label: 'Account Created', icon: <Lock className="h-5 w-5" /> },
    { label: 'Profile Details', icon: <User className="h-5 w-5" /> },
    { label: 'KYC/ID Upload', icon: <Shield className="h-5 w-5" /> },
    { label: 'Wallet Setup', icon: <CreditCard className="h-5 w-5" /> },
];

export default function ProfileSetupPage() {
  const mockUserId = 1; 
  // We are currently on the second step (index 2 in the flow, 1-based)
  const currentStep = 2; 

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50">
            Onboarding Progress
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Complete your profile to unlock full investment features.
          </p>
        </header>
        
        {/* Stepper Component in a Card */}
        <Card className="p-4 md:p-6 mb-8 shadow-xl border-t-4 border-ember-green-700 dark:border-ember-green-500">
            <Stepper currentStep={currentStep} steps={onboardingSteps} />
        </Card>
        
        {/* The Profile Setup Form component */}
        <ProfileSetupForm userId={mockUserId} />
      </div>
    </div>
  );
}