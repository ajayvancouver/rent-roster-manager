
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AddEntityModal from "@/components/common/AddEntityModal";
import AddMaintenanceRequestForm from "@/components/maintenance/AddMaintenanceRequestForm";
import MaintenanceSummaryCards from "@/components/maintenance/MaintenanceSummaryCards";
import MaintenanceFilters from "@/components/maintenance/MaintenanceFilters";
import MaintenanceTabs from "@/components/maintenance/MaintenanceTabs";
import { useMaintenanceData } from "@/hooks/useMaintenanceData";
import { maintenanceRequests } from "@/data/mockData";

const MaintenancePage = () => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const {
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
    getPropertyName
  } = useMaintenanceData();

  const handleAddRequest = () => {
    setShowAddModal(false);
    toast({
      title: "Success",
      description: "Maintenance request has been submitted successfully."
    });
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
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        onAddRequest={() => setShowAddModal(true)}
      />

      <MaintenanceTabs
        openRequests={openRequests}
        closedRequests={closedRequests}
        allRequests={sortedRequests}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={toggleSort}
        getTenantName={getTenantName}
        getPropertyName={getPropertyName}
      />

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
