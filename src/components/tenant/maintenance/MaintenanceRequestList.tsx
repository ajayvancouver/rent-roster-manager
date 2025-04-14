
import React from "react";
import MaintenanceRequestCard from "./MaintenanceRequestCard";
import MaintenanceEmptyState from "./MaintenanceEmptyState";

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

interface MaintenanceRequestListProps {
  requests: MaintenanceRequest[];
  type: 'active' | 'completed' | 'all';
}

const MaintenanceRequestList: React.FC<MaintenanceRequestListProps> = ({ requests, type }) => {
  if (requests.length === 0) {
    return <MaintenanceEmptyState type={type} />;
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <MaintenanceRequestCard key={request.id} request={request} />
      ))}
    </div>
  );
};

export default MaintenanceRequestList;
