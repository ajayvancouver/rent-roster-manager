
// Import necessary dependencies and components
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Building, Building2, RefreshCcw } from "lucide-react";
import PropertyGrid from "@/components/properties/PropertyGrid";
import PropertyList from "@/components/properties/PropertyList";
import PropertySearch from "@/components/properties/PropertySearch";
import AddEntityModal from "@/components/common/AddEntityModal";
import AddPropertyForm from "@/components/properties/AddPropertyForm";
import { useProperties } from "@/hooks/useProperties";
import { Property } from "@/types";

export default function Properties() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    properties,
    isLoading,
    error,
    tenants,
    getTenantCount,
    getVacancyCount,
    getOccupancyRate,
    handleAddProperty,
    handleUpdateProperty,
    handleDeleteProperty,
    fetchProperties
  } = useProperties();

  // Calculate totals for statistics display
  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const occupiedUnits = tenants.length;
  const vacantUnits = totalUnits - occupiedUnits;

  // Filter properties based on search query
  const filteredProperties = properties.filter(property => 
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding a new property
  const handleAddPropertySubmit = async (formData: Omit<Property, "id">) => {
    try {
      await handleAddProperty(formData);
      setShowAddModal(false);
      toast({
        title: "Success",
        description: "Property has been added successfully."
      });
      
      // Refresh properties list to show the new property
      fetchProperties();
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        title: "Error",
        description: "Failed to add property. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground mt-2">Manage your rental properties</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => fetchProperties()}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <PlusCircle className="h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>
      
      {/* Property Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-full">
            <Building2 className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Properties</p>
            <p className="text-2xl font-bold">{totalProperties}</p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-amber-50 p-3 rounded-full">
            <Building className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Units</p>
            <p className="text-2xl font-bold">{totalUnits}</p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-green-50 p-3 rounded-full">
            <Building className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Occupied Units</p>
            <p className="text-2xl font-bold">{occupiedUnits}</p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-red-50 p-3 rounded-full">
            <Building className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Vacant Units</p>
            <p className="text-2xl font-bold">{vacantUnits}</p>
          </div>
        </div>
      </div>
      
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PropertySearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewType={viewMode}
          setViewType={setViewMode}
          onAddProperty={() => setShowAddModal(true)}
        />
      </div>
      
      {/* Properties Display */}
      <div>
        {viewMode === "grid" ? (
          <PropertyGrid 
            properties={filteredProperties} 
            getTenantCount={getTenantCount}
            getVacancyCount={getVacancyCount}
            getOccupancyRate={getOccupancyRate}
            onEditProperty={handleUpdateProperty}
            onDeleteProperty={handleDeleteProperty}
          />
        ) : (
          <PropertyList 
            properties={filteredProperties} 
            getTenantCount={getTenantCount}
            getVacancyCount={getVacancyCount}
            getOccupancyRate={getOccupancyRate}
            onEditProperty={handleUpdateProperty}
            onDeleteProperty={handleDeleteProperty}
          />
        )}
        
        {filteredProperties.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? "Try adjusting your search." : "Get started by adding a new property."}
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowAddModal(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Property Modal */}
      <AddEntityModal
        title="Add New Property"
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={(formData) => {
          if (formData) {
            handleAddPropertySubmit(formData as Omit<Property, "id">);
          }
        }}
      >
        <AddPropertyForm onSuccess={handleAddPropertySubmit} />
      </AddEntityModal>
    </div>
  );
}
