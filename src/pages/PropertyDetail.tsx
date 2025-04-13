
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Users, 
  Home, 
  ClipboardList,
  Wrench,
  FileText,
  Plus,
  AlertTriangle
} from "lucide-react";
import { properties, tenants, maintenanceRequests, documents } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(properties.find(p => p.id === id));
  
  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Property Not Found</h1>
        <p className="text-muted-foreground mb-6">The property you're looking for doesn't exist or has been removed.</p>
        <Link to="/properties">
          <Button>Back to Properties</Button>
        </Link>
      </div>
    );
  }

  // Get property tenants
  const propertyTenants = tenants.filter(t => t.propertyId === property.id);
  
  // Get property maintenance requests
  const propertyMaintenance = maintenanceRequests.filter(m => m.propertyId === property.id);
  
  // Get property documents
  const propertyDocuments = documents.filter(d => d.propertyId === property.id);
  
  // Calculate occupancy
  const occupancyRate = Math.round((propertyTenants.length / property.units) * 100);
  
  // Calculate vacant units
  const vacantUnits = property.units - propertyTenants.length;
  
  // Get maintenance by status
  const pendingMaintenance = propertyMaintenance.filter(m => m.status === 'pending').length;
  const inProgressMaintenance = propertyMaintenance.filter(m => m.status === 'in-progress').length;
  const completedMaintenance = propertyMaintenance.filter(m => m.status === 'completed').length;

  // Get property type icon
  const getPropertyTypeIcon = () => {
    switch (property.type) {
      case "apartment":
        return <Building2 className="h-6 w-6 text-primary" />;
      case "house":
        return <Home className="h-6 w-6 text-primary" />;
      case "duplex":
        return <Home className="h-6 w-6 text-primary" />;
      case "commercial":
        return <Building2 className="h-6 w-6 text-primary" />;
      default:
        return <Building2 className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/properties">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <Badge className="capitalize">{property.type}</Badge>
          </div>
          <p className="text-muted-foreground ml-10">
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </p>
        </div>
        <div className="flex gap-2 ml-10 sm:ml-0">
          <Button variant="outline" size="sm">
            <Wrench className="h-4 w-4 mr-2" />
            Add Maintenance
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Property Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Units</p>
                  <p className="text-2xl font-bold">{property.units}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Occupancy</p>
                  <p className="text-2xl font-bold">{occupancyRate}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Vacant Units</p>
                  <p className="text-2xl font-bold">{vacantUnits}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100 text-red-600">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Maintenance</p>
                  <p className="text-2xl font-bold">{pendingMaintenance + inProgressMaintenance}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Image and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="overflow-hidden lg:col-span-1">
          <div className="aspect-video w-full overflow-hidden bg-secondary">
            {property.image ? (
              <img
                src={property.image}
                alt={property.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Property Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <p>{property.address}, {property.city}, {property.state} {property.zipCode}</p>
              </div>
              
              <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p className="font-medium capitalize">{property.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Units</p>
                    <p className="font-medium">{property.units}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-sm">
                  <span>Occupancy</span>
                  <span>{occupancyRate}%</span>
                </div>
                <Progress value={occupancyRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="tenants">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="tenants">Tenants</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            {/* Tenants Tab */}
            <TabsContent value="tenants" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Tenants ({propertyTenants.length})</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tenant
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {propertyTenants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No tenants found for this property
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Lease End</TableHead>
                            <TableHead>Rent</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {propertyTenants.map((tenant) => (
                            <TableRow key={tenant.id}>
                              <TableCell className="font-medium">
                                <div>
                                  <Link to={`/tenants/${tenant.id}`} className="hover:underline">
                                    {tenant.name}
                                  </Link>
                                  <div className="text-xs text-muted-foreground mt-1">{tenant.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>{tenant.unitNumber || "-"}</TableCell>
                              <TableCell>
                                {new Date(tenant.leaseEnd).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </TableCell>
                              <TableCell>${tenant.rentAmount}</TableCell>
                              <TableCell>
                                {tenant.balance > 0 ? (
                                  <Badge variant="destructive">${tenant.balance}</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                    Paid
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Link to={`/tenants/${tenant.id}`}>
                                  <Button variant="ghost" size="sm">View</Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Maintenance Requests</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {propertyMaintenance.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No maintenance requests found
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {propertyMaintenance.map((request) => {
                            const tenant = tenants.find(t => t.id === request.tenantId);
                            return (
                              <TableRow key={request.id}>
                                <TableCell>
                                  {new Date(request.dateSubmitted).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{request.title}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{request.description}</div>
                                </TableCell>
                                <TableCell>
                                  {tenant ? tenant.name : "Unknown"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      request.priority === 'low' 
                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200' 
                                        : request.priority === 'medium'
                                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200'
                                          : request.priority === 'high'
                                            ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'
                                    }
                                  >
                                    {request.priority}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      request.status === 'completed' 
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200'
                                        : request.status === 'in-progress'
                                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200'
                                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200'
                                    }
                                  >
                                    {request.status.replace('-', ' ')}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Property Documents</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {propertyDocuments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No documents found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {propertyDocuments.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded on {new Date(doc.uploadDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })} • {doc.fileSize} • {doc.fileType}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
