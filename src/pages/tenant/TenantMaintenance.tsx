
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Clock, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { useTenantPortal } from "@/hooks/useTenantPortal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TenantMaintenance: React.FC = () => {
  const { isLoading, maintenanceRequests, propertyData, profile } = useTenantPortal();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const getRequestsByStatus = (status: string | null) => {
    if (!maintenanceRequests || maintenanceRequests.length === 0) return [];
    
    if (status === null) return maintenanceRequests;
    
    return maintenanceRequests.filter(request => request.status === status);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id || !propertyData?.id) {
      toast({
        title: "Error",
        description: "Missing property or tenant information",
        variant: "destructive",
      });
      return;
    }
    
    if (!newRequest.title || !newRequest.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('maintenance').insert({
        tenant_user_id: profile.id,
        property_id: propertyData.id,
        title: newRequest.title,
        description: newRequest.description,
        priority: newRequest.priority,
        status: 'pending'
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Maintenance request submitted successfully",
      });
      
      setNewRequest({
        title: '',
        description: '',
        priority: 'medium'
      });
      
      setDialogOpen(false);
      
      // Need to refresh data - typically would use react-query here
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRequest(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setNewRequest(prev => ({ ...prev, priority: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeRequests = getRequestsByStatus('pending').concat(getRequestsByStatus('in-progress'));
  const completedRequests = getRequestsByStatus('completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Maintenance</h1>
          <p className="text-muted-foreground mt-2">Submit and track maintenance requests</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit a Maintenance Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="e.g., Leaking faucet"
                  value={newRequest.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  placeholder="Please provide details about the issue..."
                  value={newRequest.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newRequest.priority}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency - Requires immediate attention</SelectItem>
                    <SelectItem value="high">High - Needs to be fixed ASAP</SelectItem>
                    <SelectItem value="medium">Medium - Standard priority</SelectItem>
                    <SelectItem value="low">Low - Can be addressed when convenient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Requests ({activeRequests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Requests ({completedRequests.length})</TabsTrigger>
          <TabsTrigger value="all">All Requests ({maintenanceRequests.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4 mt-4">
          {activeRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-medium mb-1">No Active Requests</h3>
                <p className="text-muted-foreground">
                  You don't have any active maintenance requests.
                </p>
              </CardContent>
            </Card>
          ) : (
            activeRequests.map((request) => (
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
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{request.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Badge variant="outline" className={getStatusColor(request.status)}>
                    {request.status.replace('-', ' ')}
                  </Badge>
                  {request.assigned_to && (
                    <span className="text-sm text-muted-foreground">
                      Assigned to: {request.assigned_to}
                    </span>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4 mt-4">
          {completedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium mb-1">No Completed Requests</h3>
                <p className="text-muted-foreground">
                  You don't have any completed maintenance requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            completedRequests.map((request) => (
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
                    Completed on {formatDate(request.date_completed)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{request.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Badge variant="outline" className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                  {request.cost && (
                    <span className="text-sm font-medium">
                      Cost: ${request.cost.toFixed(2)}
                    </span>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          {maintenanceRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                <h3 className="text-xl font-medium mb-1">No Maintenance History</h3>
                <p className="text-muted-foreground">
                  You haven't submitted any maintenance requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            maintenanceRequests.map((request) => (
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
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{request.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Badge variant="outline" className={getStatusColor(request.status)}>
                    {request.status.replace('-', ' ')}
                  </Badge>
                  {request.status === 'completed' && request.date_completed && (
                    <span className="text-sm text-muted-foreground">
                      Completed: {formatDate(request.date_completed)}
                    </span>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenantMaintenance;
