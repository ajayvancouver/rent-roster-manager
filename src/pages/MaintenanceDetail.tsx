import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Wrench, User, Building, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { maintenanceService } from "@/services/maintenanceService";
import { Maintenance } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const MaintenanceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<Maintenance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [technician, setTechnician] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchMaintenanceRequest = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await maintenanceService.getById(id);
      
      if (error) throw error;
      
      setRequest(data);
      if (data?.assignedTo) {
        setTechnician(data.assignedTo);
      }
    } catch (error) {
      console.error("Error fetching maintenance request:", error);
      toast({
        title: "Error",
        description: "Could not load maintenance request details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceRequest();
  }, [id, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!id || !request) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await maintenanceService.update(id, {
        ...request,
        status: "completed",
        dateCompleted: new Date().toISOString()
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Maintenance request marked as completed.",
      });
      
      fetchMaintenanceRequest();
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      toast({
        title: "Error",
        description: "Failed to update maintenance request.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!id || !request) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await maintenanceService.update(id, {
        ...request,
        status: "cancelled"
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Maintenance request has been cancelled.",
      });
      
      fetchMaintenanceRequest();
    } catch (error) {
      console.error("Error cancelling maintenance request:", error);
      toast({
        title: "Error",
        description: "Failed to cancel maintenance request.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignTechnician = async () => {
    if (!id || !request || !technician.trim()) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await maintenanceService.update(id, {
        ...request,
        assignedTo: technician,
        status: "in-progress"
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Maintenance request assigned to ${technician}.`,
      });
      
      setShowAssignDialog(false);
      fetchMaintenanceRequest();
    } catch (error) {
      console.error("Error assigning technician:", error);
      toast({
        title: "Error",
        description: "Failed to assign technician.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/maintenance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Maintenance Request Details</h1>
          <p className="text-muted-foreground">View details of a maintenance request</p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-full max-w-sm" />
            <Skeleton className="h-4 w-full max-w-xs mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : request ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap justify-between items-center gap-2">
                <CardTitle>{request.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getPriorityColor(request.priority)}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                  </Badge>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Submitted on {formatDate(request.dateSubmitted)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <div className="bg-muted p-3 rounded-md">
                  <p>{request.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Tenant</h3>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{request.tenantName || 'No tenant assigned'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Property</h3>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{request.propertyName} {request.unitNumber ? `Unit ${request.unitNumber}` : ''}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Date Submitted</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(request.dateSubmitted)}</span>
                  </div>
                </div>
                {request.dateCompleted && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Date Completed</h3>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(request.dateCompleted)}</span>
                    </div>
                  </div>
                )}
                {request.assignedTo && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Assigned To</h3>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{request.assignedTo}</span>
                    </div>
                  </div>
                )}
                {request.cost && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Cost</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${request.cost.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.status !== 'completed' && request.status !== 'cancelled' && (
                <>
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={handleMarkAsCompleted}
                    disabled={isUpdating}
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowAssignDialog(true)}
                    disabled={isUpdating}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Assign Technician
                  </Button>
                </>
              )}
              <Button 
                className="w-full" 
                variant={request.status === 'cancelled' ? 'outline' : 'destructive'} 
                disabled={request.status === 'cancelled' || isUpdating}
                onClick={handleCancelRequest}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                {request.status === 'cancelled' ? 'Request Cancelled' : 'Cancel Request'}
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to={`/properties/${request.propertyId}`}>
                  <Building className="mr-2 h-4 w-4" />
                  View Property
                </Link>
              </Button>
              {request.tenantId && (
                <Button className="w-full" variant="outline" asChild>
                  <Link to={`/tenants/${request.tenantId}`}>
                    <User className="mr-2 h-4 w-4" />
                    View Tenant
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-lg text-center text-muted-foreground">
              Maintenance request not found. It may have been deleted or you don't have access.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/maintenance">Return to Maintenance</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
            <DialogDescription>
              Enter the name of the technician or contractor who will handle this maintenance request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="technician">Technician Name</Label>
              <Input
                id="technician"
                placeholder="Enter name"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAssignDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTechnician}
              disabled={!technician.trim() || isUpdating}
            >
              {isUpdating ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceDetail;
