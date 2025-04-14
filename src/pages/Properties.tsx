
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
import { RefreshCw, Bug, ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const Properties = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [debug, setDebug] = useState(false);
  const [showDetailedDebug, setShowDetailedDebug] = useState(false);
  
  const {
    isLoading,
    error,
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
      <div className="flex items-center gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setDebug(!debug)}
          className="flex gap-1 items-center"
        >
          <Bug className="h-4 w-4" />
          {debug ? "Hide Debug Info" : "Show Debug Info"}
        </Button>
        <span className="text-sm text-muted-foreground">
          Found {filteredProperties.length} properties (of {properties.length} total)
        </span>
        {error && (
          <Badge variant="destructive" className="ml-2">{error}</Badge>
        )}
      </div>

      {debug && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Debug Information</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDetailedDebug(!showDetailedDebug)}
                className="flex gap-1 items-center h-6 px-2"
              >
                {showDetailedDebug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showDetailedDebug ? "Less" : "More"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Current User:</p>
                <p className="text-sm text-muted-foreground">
                  User ID: {user?.id || "Not logged in"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Profile ID: {profile?.id || "No profile"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Email: {user?.email || "N/A"}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Properties Count: {properties.length}</p>
                <p className="text-sm text-muted-foreground">
                  Filtered Count: {filteredProperties.length}
                </p>
                {error && (
                  <p className="text-sm text-red-500">Error: {error}</p>
                )}
              </div>
              
              {showDetailedDebug && (
                <div className="bg-slate-50 p-4 rounded-md text-xs overflow-auto max-h-60">
                  <p className="font-medium mb-1">Properties Data:</p>
                  <pre>{JSON.stringify(properties, null, 2)}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p>Loading properties data...</p>
          </div>
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
