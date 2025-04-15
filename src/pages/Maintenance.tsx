
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AddEntityModal from "@/components/common/AddEntityModal";
import AddMaintenanceRequestForm from "@/components/maintenance/AddMaintenanceRequestForm";
import MaintenanceSummaryCards from "@/components/maintenance/MaintenanceSummaryCards";
import MaintenanceFilters from "@/components/maintenance/MaintenanceFilters";
import MaintenanceTabs from "@/components/maintenance/MaintenanceTabs";
import { useMaintenanceData } from "@/hooks/useMaintenanceData";
import { Maintenance } from "@/types";

const MaintenancePage = () => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const {
    isLoading,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    sortField,
    sortDirection,
    sortedRequests,
    openRequests,
    closedRequests,
    toggleSort,
    getTenantName,
    getPropertyName,
    handleAddRequest,
    maintenanceRequests,
    refreshData
  } = useMaintenanceData();

  const handleAddRequestSuccess = async (formData: any) => {
    const success = await handleAddRequest(formData);
    
    if (success) {
      setShowAddModal(false);
      toast({
        title: "Success",
        description: "Maintenance request has been submitted successfully."
      });
      
      // Refresh data to show the new maintenance request
      refreshData();
    } else {
      toast({
        title: "Error",
        description: "Failed to submit maintenance request. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fixed the typings to properly accept an argument and return a Promise
  // This ensures compatibility with the AddEntityModal component's onSave prop
  const modalSaveHandler = (formData: any) => {
    console.log("Form data received in modalSaveHandler:", formData);
    // We return a Promise to match the expected signature
    // but don't actually do anything with the promise since
    // AddMaintenanceRequestForm handles its own submission
    return Promise.resolve();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Maintenance</h1>
        <p className="text-muted-foreground mt-2">Track and manage maintenance requests</p>
      </div>

      <MaintenanceSummaryCards maintenanceRequests={maintenanceRequests} />

      <MaintenanceFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter as "all" | "low" | "medium" | "high" | "emergency"}
        setPriorityFilter={setPriorityFilter as React.Dispatch<React.SetStateAction<"all" | "low" | "medium" | "high" | "emergency">>}
        onAddRequest={() => setShowAddModal(true)}
      />

      <MaintenanceTabs
        openRequests={openRequests}
        closedRequests={closedRequests}
        allRequests={sortedRequests}
        sortField={sortField as keyof Maintenance}
        sortDirection={sortDirection}
        onSort={toggleSort}
        getTenantName={getTenantName}
        getPropertyName={getPropertyName}
      />

      <AddEntityModal
        title="New Maintenance Request"
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={modalSaveHandler}
      >
        <AddMaintenanceRequestForm onSuccess={handleAddRequestSuccess} />
      </AddEntityModal>
    </div>
  );
};

export default MaintenancePage;
