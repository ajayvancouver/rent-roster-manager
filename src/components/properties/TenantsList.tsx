
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  unitNumber?: string;
  propertyId: string;
}

interface TenantsListProps {
  tenants: Tenant[];
  totalUnits: number;
}

const TenantsList = ({ tenants, totalUnits }: TenantsListProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenants</CardTitle>
        <CardDescription>
          {tenants.length} of {totalUnits} units occupied
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
  );
};

export default TenantsList;
