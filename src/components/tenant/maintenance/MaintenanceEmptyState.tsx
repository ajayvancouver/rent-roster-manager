
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Wrench, AlertTriangle } from "lucide-react";

interface MaintenanceEmptyStateProps {
  type: 'active' | 'completed' | 'all';
}

const MaintenanceEmptyState: React.FC<MaintenanceEmptyStateProps> = ({ type }) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'active':
        return {
          icon: <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />,
          title: "No Active Requests",
          message: "You don't have any active maintenance requests."
        };
      case 'completed':
        return {
          icon: <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-400" />,
          title: "No Completed Requests",
          message: "You don't have any completed maintenance requests yet."
        };
      case 'all':
        return {
          icon: <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />,
          title: "No Maintenance History",
          message: "You haven't submitted any maintenance requests yet."
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <Card>
      <CardContent className="py-8 text-center">
        {content.icon}
        <h3 className="text-xl font-medium mb-1">{content.title}</h3>
        <p className="text-muted-foreground">
          {content.message}
        </p>
      </CardContent>
    </Card>
  );
};

export default MaintenanceEmptyState;
