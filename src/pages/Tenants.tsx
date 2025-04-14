
import React, { useState } from "react";
import { useTenants } from "@/hooks/useTenants";
import TenantSummaryCards from "@/components/tenants/TenantSummaryCards";
import TenantSearchBar from "@/components/tenants/TenantSearchBar";
import TenantTabs from "@/components/tenants/TenantTabs";
import AddTenantModal from "@/components/tenants/AddTenantModal";

const Tenants = () => {
  const {
    tenants,
    isLoading,
    searchQuery,
    setSearchQuery,
    getPropertyName,
    toggleSort,
    handleAddTenant,
    handleUpdateTenant,
    handleDeleteTenant,
    sortedTenants,
    activeTenants,
    inactiveTenants,
    formatDate
  } = useTenants();
  
  const [showAddModal, setShowAddModal] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tenants</h1>
        <p className="text-muted-foreground mt-2">Manage your tenants and leases</p>
      </div>

      <TenantSummaryCards tenants={tenants} />

      <TenantSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={() => setShowAddModal(true)}
      />

      <TenantTabs
        activeTenants={activeTenants}
        inactiveTenants={inactiveTenants}
        allTenants={sortedTenants}
        getPropertyName={getPropertyName}
        toggleSort={toggleSort}
        formatDate={formatDate}
        onEditTenant={handleUpdateTenant}
        onDeleteTenant={handleDeleteTenant}
      />

      <AddTenantModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddTenant={handleAddTenant}
      />
    </div>
  );
};

export default Tenants;
