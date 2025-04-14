
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { useTenantPortal } from "@/hooks/useTenantPortal";
import MaintenanceRequestForm from "@/components/tenant/maintenance/MaintenanceRequestForm";
import MaintenanceRequestList from "@/components/tenant/maintenance/MaintenanceRequestList";

const TenantMaintenance: React.FC = () => {
  const { isLoading, maintenanceRequests, propertyData, profile } = useTenantPortal();
  const [dialogOpen, setDialogOpen] = useState(false);

  const getRequestsByStatus = (status: string | null) => {
    if (!maintenanceRequests || maintenanceRequests.length === 0) return [];
    
    if (status === null) return maintenanceRequests;
    
    return maintenanceRequests.filter(request => request.status === status);
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
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const refreshPage = () => {
    // Need to refresh data - typically would use react-query here
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const activeRequests = getRequestsByStatus('pending').concat(getRequestsByStatus('in-progress'));
  const completedRequests = getRequestsByStatus('completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Maintenance</h1>
          <p className="text-muted-foreground mt-2">Submit and track maintenance requests</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Requests ({activeRequests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Requests ({completedRequests.length})</TabsTrigger>
          <TabsTrigger value="all">All Requests ({maintenanceRequests.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4 mt-4">
          <MaintenanceRequestList requests={activeRequests} type="active" />
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4 mt-4">
          <MaintenanceRequestList requests={completedRequests} type="completed" />
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          <MaintenanceRequestList requests={maintenanceRequests} type="all" />
        </TabsContent>
      </Tabs>

      <MaintenanceRequestForm 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        profileId={profile?.id}
        propertyId={propertyData?.id}
        onSuccess={refreshPage}
      />
    </div>
  );
};

export default TenantMaintenance;
