import { useState } from "react";
import { Wrench, Search, ArrowUpDown, Clock, PlusCircle, AlertTriangle } from "lucide-react";
import { maintenanceRequests, properties, tenants } from "@/data/mockData";
import { Maintenance } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AddEntityModal from "@/components/common/AddEntityModal";
import AddMaintenanceRequestForm from "@/components/maintenance/AddMaintenanceRequestForm";

const MaintenancePage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Maintenance["priority"] | "all">("all");
  const [sortField, setSortField] = useState<keyof Maintenance>("dateSubmitted");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showAddModal, setShowAddModal] = useState(false);

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : "Unknown";
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : "Unknown";
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    if (priorityFilter !== "all" && request.priority !== priorityFilter) {
      return false;
    }
    
    const searchTerms = searchQuery.toLowerCase();
    const tenantName = getTenantName(request.tenantId).toLowerCase();
    const propertyName = getPropertyName(request.propertyId).toLowerCase();
    
    return (
      request.title.toLowerCase().includes(searchTerms) ||
      request.description.toLowerCase().includes(searchTerms) ||
      tenantName.includes(searchTerms) ||
      propertyName.includes(searchTerms) ||
      request.priority.includes(searchTerms) ||
      request.status.includes(searchTerms)
    );
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortField === "dateSubmitted") {
      return sortDirection === "asc"
        ? new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime()
        : new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime();
    } else if (sortField === "priority") {
      const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
      return sortDirection === "asc"
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return 0;
  });

  const openRequests = sortedRequests.filter(r => r.status === "pending" || r.status === "in-progress");
  const closedRequests = sortedRequests.filter(r => r.status === "completed" || r.status === "cancelled");

  const toggleSort = (field: keyof Maintenance) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

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

  const handleAddRequest = () => {
    setShowAddModal(false);
    toast({
      title: "Success",
      description: "Maintenance request has been submitted successfully."
    });
  };

  const pendingCount = maintenanceRequests.filter(r => r.status === "pending").length;
  const inProgressCount = maintenanceRequests.filter(r => r.status === "in-progress").length;
  const emergencyCount = maintenanceRequests.filter(
    r => r.priority === "emergency" && (r.status === "pending" || r.status === "in-progress")
  ).length;

  const renderRequestsTable = (requests: Maintenance[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Issue</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8" onClick={() => toggleSort("dateSubmitted")}>
                Date <ArrowUpDown className="h-4 w-4 ml-1" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8" onClick={() => toggleSort("priority")}>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Maintenance</h1>
        <p className="text-muted-foreground mt-2">Track and manage maintenance requests</p>
      </div>

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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search maintenance requests..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={priorityFilter}
          onValueChange={(value) => setPriorityFilter(value as Maintenance["priority"] | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowAddModal(true)}>
          <PlusCircle className="h-4 w-4 mr-1" />
          New Request
        </Button>
      </div>

      <Tabs defaultValue="open" className="w-full">
        <TabsList>
          <TabsTrigger value="open">Open Requests</TabsTrigger>
          <TabsTrigger value="closed">Closed Requests</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="open" className="mt-4">
          {renderRequestsTable(openRequests)}
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          {renderRequestsTable(closedRequests)}
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          {renderRequestsTable(sortedRequests)}
        </TabsContent>
      </Tabs>

      <AddEntityModal
        title="New Maintenance Request"
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={handleAddRequest}
      >
        <AddMaintenanceRequestForm onSuccess={handleAddRequest} />
      </AddEntityModal>
    </div>
  );
};

export default MaintenancePage;
