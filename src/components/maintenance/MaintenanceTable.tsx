
import { ArrowUpDown } from "lucide-react";
import { Maintenance } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MaintenanceTableProps {
  requests: Maintenance[];
  sortField: keyof Maintenance;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof Maintenance) => void;
  getTenantName: (tenantId: string) => string;
  getPropertyName: (propertyId: string) => string;
}

const MaintenanceTable = ({
  requests,
  sortField,
  sortDirection,
  onSort,
  getTenantName,
  getPropertyName
}: MaintenanceTableProps) => {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Issue</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8" onClick={() => onSort("dateSubmitted")}>
                Date <ArrowUpDown className="h-4 w-4 ml-1" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8" onClick={() => onSort("priority")}>
                Priority <ArrowUpDown className="h-4 w-4 ml-1" />
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No maintenance requests found
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  <div>
                    {request.title}
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {request.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getPropertyName(request.propertyId)}</TableCell>
                <TableCell>{getTenantName(request.tenantId)}</TableCell>
                <TableCell>{formatDate(request.dateSubmitted)}</TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(request.priority)}>
                    {request.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(request.status)}>
                    {request.status.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    Details
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
