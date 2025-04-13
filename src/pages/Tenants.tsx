
import { useState } from "react";
import { 
  ArrowUpDown, 
  Search, 
  Banknote, 
  UserCheck, 
  UserMinus,
  ClipboardList,
  Users
} from "lucide-react";
import { tenants, properties } from "@/data/mockData";
import { Tenant } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Tenants = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Tenant>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Get property name by ID
  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : "Unknown Property";
  };

  // Filter and sort tenants
  const filteredTenants = tenants.filter(tenant => {
    const searchTerms = searchQuery.toLowerCase();
    return (
      tenant.name.toLowerCase().includes(searchTerms) ||
      tenant.email.toLowerCase().includes(searchTerms) ||
      getPropertyName(tenant.propertyId).toLowerCase().includes(searchTerms)
    );
  });

  const sortedTenants = [...filteredTenants].sort((a, b) => {
    if (sortField === "name" || sortField === "email") {
      return sortDirection === "asc"
        ? a[sortField].localeCompare(b[sortField])
        : b[sortField].localeCompare(a[sortField]);
    } else if (sortField === "rentAmount" || sortField === "balance") {
      return sortDirection === "asc"
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    } else if (sortField === "leaseEnd") {
      return sortDirection === "asc"
        ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
        : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
    }
    return 0;
  });

  // Get active, inactive, and all tenants
  const activeTenants = sortedTenants.filter(t => t.status === "active");
  const inactiveTenants = sortedTenants.filter(t => t.status !== "active");

  // Toggle sort
  const toggleSort = (field: keyof Tenant) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTenantTable = (tenantsList: Tenant[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">
              <Button variant="ghost" className="p-0 h-8" onClick={() => toggleSort("name")}>
                Tenant Name <ArrowUpDown className="h-4 w-4 ml-1" />
              </Button>
            </TableHead>
            <TableHead>Property</TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8" onClick={() => toggleSort("rentAmount")}>
                Rent <ArrowUpDown className="h-4 w-4 ml-1" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8" onClick={() => toggleSort("balance")}>
                Balance <ArrowUpDown className="h-4 w-4 ml-1" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8" onClick={() => toggleSort("leaseEnd")}>
                Lease End <ArrowUpDown className="h-4 w-4 ml-1" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenantsList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No tenants found
              </TableCell>
            </TableRow>
          ) : (
            tenantsList.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">
                  <div>
                    {tenant.name}
                    <div className="text-xs text-muted-foreground mt-1">{tenant.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    {getPropertyName(tenant.propertyId)}
                    {tenant.unitNumber && (
                      <div className="text-xs text-muted-foreground">Unit {tenant.unitNumber}</div>
                    )}
                  </div>
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
                <TableCell>{formatDate(tenant.leaseEnd)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" title="Record Payment">
                      <Banknote className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" title="View Details">
                      <ClipboardList className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tenants</h1>
        <p className="text-muted-foreground mt-2">Manage your tenants and leases</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
                <h3 className="text-2xl font-bold">{tenants.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-4">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Leases</p>
                <h3 className="text-2xl font-bold">
                  {tenants.filter(t => t.status === "active").length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-red-100 text-red-600 mr-4">
                <UserMinus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive Tenants</p>
                <h3 className="text-2xl font-bold">
                  {tenants.filter(t => t.status !== "active").length}
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
            placeholder="Search tenants..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>Add Tenant</Button>
      </div>

      {/* Tenants Table */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Tenants</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Tenants</TabsTrigger>
          <TabsTrigger value="all">All Tenants</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          {renderTenantTable(activeTenants)}
        </TabsContent>
        <TabsContent value="inactive" className="mt-4">
          {renderTenantTable(inactiveTenants)}
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          {renderTenantTable(sortedTenants)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tenants;
