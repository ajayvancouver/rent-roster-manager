
import { useState } from "react";
import { Building2, Search, Users, Home, Building } from "lucide-react";
import { properties, tenants } from "@/data/mockData";
import { Property } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const searchTerms = searchQuery.toLowerCase();
    return (
      property.name.toLowerCase().includes(searchTerms) ||
      property.address.toLowerCase().includes(searchTerms) ||
      property.city.toLowerCase().includes(searchTerms)
    );
  });

  // Get tenant count for a property
  const getTenantCount = (propertyId: string) => {
    return tenants.filter(tenant => tenant.propertyId === propertyId).length;
  };

  // Get vacancy count for a property
  const getVacancyCount = (property: Property) => {
    const occupiedUnits = getTenantCount(property.id);
    return property.units - occupiedUnits;
  };

  // Get property type icon
  const getPropertyTypeIcon = (type: Property["type"]) => {
    switch (type) {
      case "apartment":
        return <Building2 className="h-5 w-5" />;
      case "house":
        return <Home className="h-5 w-5" />;
      case "duplex":
        return <Building className="h-5 w-5" />;
      case "commercial":
        return <Building className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Properties</h1>
        <p className="text-muted-foreground mt-2">Manage your rental properties</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <h3 className="text-2xl font-bold">{properties.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-4">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Units</p>
                <h3 className="text-2xl font-bold">
                  {properties.reduce((sum, property) => sum + property.units, 0)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600 mr-4">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                <h3 className="text-2xl font-bold">
                  {Math.round((tenants.length / properties.reduce((sum, p) => sum + p.units, 0)) * 100)}%
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search properties..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewType === "grid" ? "default" : "outline"}
            onClick={() => setViewType("grid")}
            className="px-3"
          >
            Grid
          </Button>
          <Button
            variant={viewType === "list" ? "default" : "outline"}
            onClick={() => setViewType("list")}
            className="px-3"
          >
            List
          </Button>
          <Button>Add Property</Button>
        </div>
      </div>

      {/* Properties Grid/List */}
      {viewType === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden card-hover">
              <div className="aspect-video w-full overflow-hidden bg-secondary">
                {property.image ? (
                  <img
                    src={property.image}
                    alt={property.name}
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{property.name}</h3>
                  <Badge className="capitalize">{property.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Units</p>
                    <p className="font-medium">{property.units}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tenants</p>
                    <p className="font-medium">{getTenantCount(property.id)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vacancies</p>
                    <p className="font-medium">{getVacancyCount(property)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Occupancy</p>
                    <p className="font-medium">
                      {Math.round((getTenantCount(property.id) / property.units) * 100)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="card-hover">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        {getPropertyTypeIcon(property.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {property.address}, {property.city}, {property.state} {property.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row gap-4 md:gap-8">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Units</p>
                      <p className="font-medium">{property.units}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Tenants</p>
                      <p className="font-medium">{getTenantCount(property.id)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Vacancies</p>
                      <p className="font-medium">{getVacancyCount(property)}</p>
                    </div>
                    <div className="text-center">
                      <Badge>
                        {Math.round((getTenantCount(property.id) / property.units) * 100)}% Occupied
                      </Badge>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;
