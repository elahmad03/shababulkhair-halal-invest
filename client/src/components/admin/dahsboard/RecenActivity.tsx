// /components/admin/dashboard/recent-activity-feed.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityItem } from "@/lib/types/dashboard";
import { formatDistanceToNow } from 'date-fns';
import { Users, TrendingUp, CircleDollarSign } from "lucide-react";
import React from "react";

const iconMap = {
  registration: <Users className="h-4 w-4" />,
  investment: <TrendingUp className="h-4 w-4 text-green-500" />,
  withdrawal: <CircleDollarSign className="h-4 w-4 text-orange-500" />,
};

type RecentActivityFeedProps = {
  activities: ActivityItem[];
};

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  {iconMap[activity.type]}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground">No recent activities.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}