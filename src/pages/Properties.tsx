
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AddEntityModal from "@/components/common/AddEntityModal";
import AddPropertyForm from "@/components/properties/AddPropertyForm";
import { useProperties } from "@/hooks/useProperties";
import PropertyStats from "@/components/properties/PropertyStats";
import PropertySearch from "@/components/properties/PropertySearch";
import PropertyGrid from "@/components/properties/PropertyGrid";
import PropertyList from "@/components/properties/PropertyList";

const Properties = () => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const {
    isLoading,
    filteredProperties,
    searchQuery,
    setSearchQuery,
    viewType,
    setViewType,
    getTenantCount,
    getVacancyCount,
    getPropertyTypeIcon,
    getOccupancyRate,
    getOverallOccupancyRate
  } = useProperties();

  const handleAddProperty = () => {
    setShowAddModal(false);
    toast({
      title: "Success",
      description: "Property has been added successfully."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Properties</h1>
        <p className="text-muted-foreground mt-2">Manage your rental properties</p>
      </div>

      {/* Stats Row */}
      <PropertyStats 
        properties={filteredProperties} 
        getOverallOccupancyRate={getOverallOccupancyRate} 
      />

      {/* Action Bar */}
      <PropertySearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewType={viewType}
        setViewType={setViewType}
        onAddProperty={() => setShowAddModal(true)}
      />

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <p>Loading properties data...</p>
        </div>
      ) : (
        // Properties Grid/List
        viewType === "grid" ? (
          <PropertyGrid 
            properties={filteredProperties}
            getTenantCount={getTenantCount}
            getVacancyCount={getVacancyCount}
            getOccupancyRate={getOccupancyRate}
          />
        ) : (
          <PropertyList
            properties={filteredProperties}
            getTenantCount={getTenantCount}
            getVacancyCount={getVacancyCount}
            getOccupancyRate={getOccupancyRate}
          />
        )
      )}

      {/* Add Property Modal */}
      <AddEntityModal
        title="Add New Property"
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={handleAddProperty}
      >
        <AddPropertyForm onSuccess={handleAddProperty} />
      </AddEntityModal>
    </div>
  );
};

export default Properties;
