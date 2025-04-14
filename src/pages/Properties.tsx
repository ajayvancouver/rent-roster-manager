
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import AddEntityModal from "@/components/common/AddEntityModal";
import AddPropertyForm from "@/components/properties/AddPropertyForm";
import { useProperties } from "@/hooks/useProperties";
import PropertyStats from "@/components/properties/PropertyStats";
import PropertySearch from "@/components/properties/PropertySearch";
import PropertyGrid from "@/components/properties/PropertyGrid";
import PropertyList from "@/components/properties/PropertyList";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Properties = () => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [debug, setDebug] = useState(false);
  
  const {
    isLoading,
    filteredProperties,
    properties,
    searchQuery,
    setSearchQuery,
    viewType,
    setViewType,
    getTenantCount,
    getVacancyCount,
    getPropertyTypeIcon,
    getOccupancyRate,
    getOverallOccupancyRate,
    handleAddProperty,
    fetchProperties
  } = useProperties();

  // Handle successful property addition
  const onPropertyAdded = () => {
    setShowAddModal(false);
    fetchProperties(); // Refresh properties after adding
    toast({
      title: "Success",
      description: "Property has been added successfully."
    });
  };

  // Force refresh properties
  const handleRefresh = () => {
    fetchProperties();
    toast({
      title: "Refreshing",
      description: "Refreshing property data from database..."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground mt-2">Manage your rental properties</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          className="flex gap-2 items-center"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Debug Info */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setDebug(!debug)}
        >
          {debug ? "Hide Debug Info" : "Show Debug Info"}
        </Button>
        <span className="text-sm text-muted-foreground">
          Found {filteredProperties.length} properties (of {properties.length} total)
        </span>
      </div>

      {debug && (
        <div className="bg-slate-50 p-4 rounded-md text-xs overflow-auto max-h-60">
          <p className="font-medium mb-1">Properties Data:</p>
          <pre>{JSON.stringify(properties, null, 2)}</pre>
        </div>
      )}

      {/* Stats Row */}
      <PropertyStats 
        properties={filteredProperties} 
        getOverallOccupancyRate={getOverallOccupancyRate} 
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <PropertySearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewType={viewType}
          setViewType={setViewType}
          onAddProperty={() => setShowAddModal(true)}
        />
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <p>Loading properties data...</p>
        </div>
      ) : (
        // Properties Grid/List
        filteredProperties.length > 0 ? (
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No properties found. Add a property to get started.</p>
            <Button onClick={() => setShowAddModal(true)}>Add Property</Button>
          </div>
        )
      )}

      {/* Add Property Modal */}
      <AddEntityModal
        title="Add New Property"
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={onPropertyAdded}
      >
        <AddPropertyForm onSuccess={onPropertyAdded} />
      </AddEntityModal>
    </div>
  );
};

export default Properties;
