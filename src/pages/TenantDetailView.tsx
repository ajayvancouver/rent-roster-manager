
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tenant } from "@/types";
import { tenantsService, paymentsService, maintenanceService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Home, CreditCard, Calendar, Building2, Wrench, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

const TenantDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenantDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const fetchedTenant = await tenantsService.getById(id);
        setTenant(fetchedTenant);
        
        // Fetch payments for this tenant
        const allPayments = await paymentsService.getAll();
        const tenantPayments = allPayments.filter(payment => payment.tenantId === id);
        setPayments(tenantPayments);
        
        // Fetch maintenance requests for this tenant
        const allMaintenanceRequests = await maintenanceService.getAll();
        const tenantMaintenanceRequests = allMaintenanceRequests.filter(request => request.tenantId === id);
        setMaintenanceRequests(tenantMaintenanceRequests);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching tenant details:", error);
        toast({
          title: "Error",
          description: "Failed to load tenant details",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchTenantDetails();
  }, [id, toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading tenant details...</div>;
  }

  if (!tenant) {
    return <div className="flex justify-center items-center h-64">Tenant not found</div>;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (err) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{tenant.name}</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <Badge variant={tenant.status === 'active' ? 'default' : 'outline'} className="mr-2">
              {tenant.status}
            </Badge>
            {tenant.propertyName && (
              <span className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                {tenant.propertyName}
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/tenants')}>
          Back to Tenants
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tenant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-xl">{tenant.name}</h3>
                <Badge variant={tenant.status === 'active' ? 'default' : 'outline'}>
                  {tenant.status}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{tenant.email}</span>
              </div>
              
              {tenant.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{tenant.phone}</span>
                </div>
              )}
              
              {tenant.propertyAddress && (
                <div className="flex items-center">
                  <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{tenant.propertyAddress}</span>
                </div>
              )}
              
              {tenant.unitNumber && (
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Unit {tenant.unitNumber}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lease Information */}
        <Card>
          <CardHeader>
            <CardTitle>Lease Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Lease Start</p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formatDate(tenant.leaseStart)}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Lease End</p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formatDate(tenant.leaseEnd)}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Rent Amount</p>
                <div className="flex items-center mt-1">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formatCurrency(tenant.rentAmount)}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Deposit</p>
                <div className="flex items-center mt-1">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formatCurrency(tenant.depositAmount)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <div className="flex items-center mt-1">
                <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className={tenant.balance > 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                  {formatCurrency(tenant.balance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest payments and maintenance requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(payments.length > 0 || maintenanceRequests.length > 0) ? (
              <div className="space-y-3">
                {payments.slice(0, 3).map(payment => (
                  <div key={payment.id} className="flex items-center p-2 rounded-md hover:bg-accent/50">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment {payment.status}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(payment.date)}</p>
                    </div>
                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
                
                {maintenanceRequests.slice(0, 3).map(request => (
                  <div key={request.id} className="flex items-center p-2 rounded-md hover:bg-accent/50">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <Wrench className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{request.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> 
                        {formatDate(request.dateSubmitted)}
                      </p>
                    </div>
                    <Badge variant={
                      request.status === 'completed' ? 'default' : 
                      request.status === 'in-progress' ? 'secondary' : 'outline'
                    }>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
          {(payments.length > 0 || maintenanceRequests.length > 0) && (
            <CardFooter>
              <div className="flex justify-between w-full">
                {payments.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/payments')}>
                    View All Payments
                  </Button>
                )}
                {maintenanceRequests.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/maintenance')}>
                    View All Maintenance
                  </Button>
                )}
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TenantDetailView;
