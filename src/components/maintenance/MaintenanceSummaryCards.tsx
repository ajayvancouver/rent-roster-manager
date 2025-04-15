
import { Clock, Wrench, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Maintenance } from "@/types";

interface MaintenanceSummaryCardsProps {
  maintenanceRequests: Maintenance[];
}

const MaintenanceSummaryCards = ({ maintenanceRequests }: MaintenanceSummaryCardsProps) => {
  const pendingCount = maintenanceRequests.filter(r => r.status === "pending").length;
  const inProgressCount = maintenanceRequests.filter(r => r.status === "in-progress").length;
  const emergencyCount = maintenanceRequests.filter(
    r => r.priority === "emergency" && (r.status === "pending" || r.status === "in-progress")
  ).length;

  // Properly calculate open requests count
  const openRequestsCount = pendingCount + inProgressCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <h3 className="text-2xl font-bold">{pendingCount}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <h3 className="text-2xl font-bold">{inProgressCount}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100 text-red-600 mr-4">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Emergency</p>
              <h3 className="text-2xl font-bold">{emergencyCount}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceSummaryCards;
