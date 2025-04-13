
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { Payment, Maintenance, Document } from "@/types";

const TenantDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [propertyInfo, setPropertyInfo] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  const [date, setDate] = useState<DateRange>({
    from: startOfMonth(subMonths(new Date(), 3)),
    to: endOfMonth(new Date())
  });

  useEffect(() => {
    const fetchTenantData = async () => {
      if (!user) return;
      
      try {
        // Fetch tenant info
        const { data: tenantData, error: tenantError } = await supabase
          .from("tenants")
          .select("*, properties(id, name, address, city, state, zip_code)")
          .eq("tenant_user_id", user.id)
          .single();
        
        if (tenantError) throw tenantError;
        
        if (tenantData) {
          setTenantInfo(tenantData);
          setPropertyInfo(tenantData.properties);
          
          // Fetch payments
          const { data: paymentsData, error: paymentsError } = await supabase
            .from("payments")
            .select("*")
            .eq("tenant_id", tenantData.id)
            .order("date", { ascending: false });
          
          if (paymentsError) throw paymentsError;
          // Map database fields to match our Payment type
          const mappedPayments = (paymentsData || []).map(payment => ({
            id: payment.id,
            tenantId: payment.tenant_id,
            propertyId: payment.property_id || null,
            amount: payment.amount,
            date: payment.date,
            method: payment.method,
            status: payment.status,
            notes: payment.notes
          }));
          setPayments(mappedPayments);
          
          // Fetch maintenance requests
          const { data: maintenanceData, error: maintenanceError } = await supabase
            .from("maintenance")
            .select("*")
            .eq("tenant_id", tenantData.id)
            .order("date_submitted", { ascending: false });
          
          if (maintenanceError) throw maintenanceError;
          // Map database fields to match our Maintenance type
          const mappedMaintenance = (maintenanceData || []).map(item => ({
            id: item.id,
            propertyId: item.property_id,
            tenantId: item.tenant_id,
            title: item.title,
            description: item.description,
            priority: item.priority as Maintenance["priority"],
            status: item.status as Maintenance["status"],
            dateSubmitted: item.date_submitted,
            dateCompleted: item.date_completed,
            assignedTo: item.assigned_to,
            cost: item.cost
          }));
          setMaintenance(mappedMaintenance);
          
          // Fetch documents
          const { data: documentsData, error: documentsError } = await supabase
            .from("documents")
            .select("*")
            .eq("tenant_id", tenantData.id)
            .order("upload_date", { ascending: false });
          
          if (documentsError) throw documentsError;
          // Map database fields to match our Document type
          const mappedDocuments = (documentsData || []).map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type as Document["type"],
            tenantId: doc.tenant_id,
            propertyId: doc.property_id,
            uploadDate: doc.upload_date,
            fileSize: doc.file_size,
            fileType: doc.file_type,
            url: doc.url
          }));
          setDocuments(mappedDocuments);
        }
        
      } catch (error) {
        console.error("Error fetching tenant data:", error);
        toast({
          title: "Error",
          description: "Failed to load your tenant information",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTenantData();
  }, [user, toast]);

  if (isLoading) {
    return <div className="p-8">Loading your tenant portal...</div>;
  }

  if (!tenantInfo) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to Tenant Portal</h2>
              <p className="text-muted-foreground">
                Your account is not yet linked to a tenant record. Please contact your property manager.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderPayments = () => {
    const filteredPayments = payments.filter(payment => {
      if (!date.from) return true;
      const paymentDate = new Date(payment.date);
      if (date.from && date.to) {
        return paymentDate >= date.from && paymentDate <= date.to;
      }
      return paymentDate >= date.from;
    });

    if (filteredPayments.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No payment records found for the selected date range.
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-4">
        {filteredPayments.map(payment => (
          <Card key={payment.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{formatDate(payment.date)}</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.method} {payment.notes && `- ${payment.notes}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold">{formatCurrency(payment.amount)}</p>
                  <Badge className={payment.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : payment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }>
                    {payment.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderMaintenance = () => {
    if (maintenance.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No maintenance requests found.
        </div>
      );
    }

    const getPriorityColor = (priority: Maintenance["priority"]) => {
      switch (priority) {
        case "emergency": return "bg-red-500 text-white";
        case "high": return "bg-orange-500 text-white";
        case "medium": return "bg-yellow-500 text-white";
        case "low": return "bg-blue-500 text-white";
        default: return "bg-gray-500 text-white";
      }
    };
    
    const getStatusColor = (status: Maintenance["status"]) => {
      switch (status) {
        case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200";
        case "completed": return "bg-green-100 text-green-800 border-green-200";
        case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    return (
      <div className="space-y-4 mt-4">
        {maintenance.map(request => (
          <Card key={request.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{request.title}</h3>
                  <Badge className={getPriorityColor(request.priority)}>
                    {request.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <span>Submitted: {formatDate(request.dateSubmitted)}</span>
                  <Badge variant="outline" className={getStatusColor(request.status)}>
                    {request.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderDocuments = () => {
    if (documents.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No documents found.
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-4">
        {documents.map(document => (
          <Card key={document.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{document.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {document.type} - {document.fileSize} - {formatDate(document.uploadDate)}
                  </p>
                </div>
                <a 
                  href={document.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-sm"
                >
                  View
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Tenant Portal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Property</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{propertyInfo?.name}</p>
            <p className="text-sm text-muted-foreground">
              {propertyInfo?.address}, {propertyInfo?.city}, {propertyInfo?.state} {propertyInfo?.zip_code}
            </p>
            {tenantInfo.unitNumber && (
              <p className="mt-1 text-sm">Unit: {tenantInfo.unitNumber}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Lease</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Start</p>
                <p className="font-medium">{formatDate(tenantInfo.leaseStart)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End</p>
                <p className="font-medium">{formatDate(tenantInfo.leaseEnd)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatCurrency(tenantInfo.rentAmount)}/month</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Balance:</span>
              <span className={`font-bold ${tenantInfo.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {formatCurrency(tenantInfo.balance)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="payments" className="mt-8">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="mt-4">
          <div className="mb-4">
            <DateRangePicker date={date} setDate={setDate} />
          </div>
          {renderPayments()}
        </TabsContent>
        
        <TabsContent value="maintenance" className="mt-4">
          {renderMaintenance()}
        </TabsContent>
        
        <TabsContent value="documents" className="mt-4">
          {renderDocuments()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenantDashboard;
