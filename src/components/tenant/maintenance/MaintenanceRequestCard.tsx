
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  date_submitted: string;
  date_completed?: string;
  assigned_to?: string;
  cost?: number;
}

interface MaintenanceRequestCardProps {
  request: MaintenanceRequest;
}

const MaintenanceRequestCard: React.FC<MaintenanceRequestCardProps> = ({ request }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card key={request.id}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{request.title}</CardTitle>
          <Badge className={getPriorityColor(request.priority)}>
            {request.priority}
          </Badge>
        </div>
        <CardDescription className="flex items-center mt-1">
          <Clock className="h-3 w-3 mr-1" />
          Submitted on {formatDate(request.date_submitted)}
          {request.status === 'completed' && request.date_completed && (
            <>, completed on {formatDate(request.date_completed)}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{request.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Badge variant="outline" className={getStatusColor(request.status)}>
          {request.status.replace('-', ' ')}
        </Badge>
        {request.status === 'completed' && request.cost && (
          <span className="text-sm font-medium">
            Cost: ${request.cost.toFixed(2)}
          </span>
        )}
        {request.assigned_to && (
          <span className="text-sm text-muted-foreground">
            Assigned to: {request.assigned_to}
          </span>
        )}
      </CardFooter>
    </Card>
  );
};

export default MaintenanceRequestCard;
