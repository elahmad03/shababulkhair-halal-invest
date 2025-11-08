import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  Icon: LucideIcon;
  color: string; 
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, Icon, color }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-800">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-extrabold text-gray-900 dark:text-gray-50">{value}</div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>
    </CardContent>
  </Card>
);