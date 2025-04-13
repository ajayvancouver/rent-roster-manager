
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Maintenance } from "@/types";
import { cn } from "@/lib/utils";

interface MaintenanceTableProps {
  requests: Maintenance[];
  getTenantName: (id: string | undefined) => string;
  getPropertyName: (id: string) => string;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  emptyMessage?: string;
}

const MaintenanceTable = ({
  requests,
  getTenantName,
  getPropertyName,
  sortField,
  sortDirection,
  onSort,
  emptyMessage = "No maintenance requests found",
}: MaintenanceTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "emergency":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("title")}
            >
              Issue
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("propertyId")}
            >
              Property
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("tenantId")}
            >
              Tenant
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("priority")}
            >
              Priority
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("status")}
            >
              Status
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort("dateSubmitted")}
            >
              Date
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.title}</TableCell>
                <TableCell>{getPropertyName(request.propertyId)}</TableCell>
                <TableCell>
                  {request.tenantId ? getTenantName(request.tenantId) : "N/A"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(getPriorityColor(request.priority))}
                  >
                    {request.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(getStatusColor(request.status))}
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(request.dateSubmitted)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/maintenance/${request.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MaintenanceTable;
