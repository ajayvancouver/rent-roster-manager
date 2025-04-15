
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Property } from "@/types";
import { propertiesService } from "@/services/supabaseService";
import { tenantsService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { Building2, Home, MapPin, Users, Warehouse, Phone, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { usePropertyManager } from "@/hooks/usePropertyManager";

const PropertyDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { properties, tenants: allTenants } = usePropertyManager();

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!id) {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Property ID is missing",
          variant: "destructive"
        });
        navigate('/properties');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Looking for property with ID:", id);
        console.log("Available properties:", properties);
        
        // First try to find the property in the already loaded properties
        const foundProperty = properties.find(p => p.id === id);
        
        if (foundProperty) {
          console.log("Found property in cache:", foundProperty);
          setProperty(foundProperty);
          
          // Filter tenants for this property from already loaded tenants
          const propertyTenants = allTenants.filter(tenant => tenant.propertyId === id);
          console.log("Filtered tenants:", propertyTenants);
          setTenants(propertyTenants);
          setIsLoading(false);
          return;
        }
        
        // If not found in the cached properties, fetch from the API
        console.log("Fetching property from API with ID:", id);
        const fetchedProperty = await propertiesService.getById(id);
        console.log("API response for property:", fetchedProperty);
        
        if (!fetchedProperty) {
          console.error("No property found with ID:", id);
          toast({
            title: "Property not found",
            description: "The property you are looking for does not exist",
            variant: "destructive"
          });
          navigate('/properties');
          return;
        }
        
        setProperty(fetchedProperty);
        
        // Fetch tenants for this property
        console.log("Fetching tenants for property:", id);
        const allTenantsData = await tenantsService.getAll();
        const filteredTenants = allTenantsData.filter(tenant => tenant.propertyId === id);
        console.log("Filtered tenants from API:", filteredTenants);
        setTenants(filteredTenants);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching property details:", error);
        toast({
          title: "Error",
          description: "Failed to load property details",
          variant: "destructive"
        });
        setIsLoading(false);
        navigate('/properties');
      }
    };
    
    fetchPropertyDetails();
  }, [id, toast, navigate, properties, allTenants]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading property details...</div>;
  }

  if (!property) {
    return <div className="flex justify-center items-center h-64">Property not found</div>;
  }

  // Calculate occupancy rate
  const occupancyRate = property.units > 0 
    ? Math.round((tenants.length / property.units) * 100) 
    : 0;

  // Get the property type icon
  const PropertyTypeIcon = () => {
    switch (property.type) {
      case 'house':
        return <Home className="h-5 w-5" />;
      case 'apartment':
        return <Building2 className="h-5 w-5" />;
      case 'commercial':
        return <Warehouse className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{property.name}</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <p>{property.address}, {property.city}, {property.state} {property.zipCode}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/properties')}>
          Back to Properties
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Property Image */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            {property.image ? (
              <img 
                src={property.image} 
                alt={property.name} 
                className="w-full h-64 object-cover rounded-md" 
              />
            ) : (
              <div className="w-full h-64 bg-muted flex items-center justify-center rounded-md">
                <Building2 className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Info */}
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <PropertyTypeIcon />
                <span className="ml-2 capitalize">{property.type}</span>
              </div>
              <Badge>{property.units} Units</Badge>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Occupancy Rate</p>
              <div className="flex items-center gap-2">
                <Progress value={occupancyRate} className="h-2" />
                <span className="text-sm font-medium">{occupancyRate}%</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Units</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Occupied: {tenants.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>Vacant: {property.units - tenants.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tenants</CardTitle>
          <CardDescription>
            {tenants.length} of {property.units} units occupied
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenants.length > 0 ? (
            <div className="space-y-4">
              {tenants.map(tenant => (
                <div 
                  key={tenant.id} 
                  className="p-4 border rounded-lg flex items-center justify-between hover:bg-accent/50 cursor-pointer"
                  onClick={() => navigate(`/tenants/${tenant.id}`)}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">Unit {tenant.unitNumber || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm hidden md:inline">{tenant.email}</span>
                    </div>
                    {tenant.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm hidden md:inline">{tenant.phone}</span>
                      </div>
                    )}
                    <Badge variant={tenant.status === 'active' ? 'default' : 'outline'}>
                      {tenant.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No tenants found for this property
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDetailView;
