
import { Maintenance } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecentMaintenanceListProps {
  maintenanceRequests: Maintenance[];
}

const RecentMaintenanceList = ({ maintenanceRequests }: RecentMaintenanceListProps) => {
  // Get prioritized and recent maintenance requests
  const recentRequests = [...maintenanceRequests]
    .sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by date (most recent first)
      return new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime();
    })
    .slice(0, 5);

  const getPriorityColor = (priority: Maintenance["priority"]) => {
    switch (priority) {
      case "emergency": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: Maintenance["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle>Recent Maintenance Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentRequests.map(request => (
            <div key={request.id} className="flex flex-col space-y-2 p-3 bg-secondary/30 rounded-md">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm">{request.title}</h4>
                <Badge className={cn("ml-2", getPriorityColor(request.priority))}>
                  {request.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{request.description}</p>
              <div className="flex justify-between items-center text-xs">
                <span>Submitted: {formatDate(request.dateSubmitted)}</span>
                <Badge variant="outline" className={getStatusColor(request.status)}>
                  {request.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentMaintenanceList;
