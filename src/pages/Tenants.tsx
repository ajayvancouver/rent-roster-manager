
import React, { useState } from "react";
import { useTenants } from "@/hooks/useTenants";
import TenantSummaryCards from "@/components/tenants/TenantSummaryCards";
import TenantSearchBar from "@/components/tenants/TenantSearchBar";
import TenantTabs from "@/components/tenants/TenantTabs";
import AddTenantModal from "@/components/tenants/AddTenantModal";
import UpdateTenantRent from "@/components/tenants/UpdateTenantRent";
import { Button } from "@/components/ui/button";

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
    formatDate,
    fetchTenants
  } = useTenants();
  
  const [showAddModal, setShowAddModal] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if Ajay Tenant 2 has incorrect rent
  const ajayTenant2 = tenants.find(t => 
    t.email === "tenant2@test.com" && t.rentAmount === 2000
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-muted-foreground mt-2">Manage your tenants and leases</p>
        </div>
        {ajayTenant2 && (
          <UpdateTenantRent onSuccess={fetchTenants} />
        )}
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
