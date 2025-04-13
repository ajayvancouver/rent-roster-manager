
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Building, 
  Calendar, 
  Banknote, 
  FileText, 
  Mail, 
  Phone,
  ClipboardList,
  AlertTriangle
} from "lucide-react";
import { tenants, properties, payments, maintenanceRequests, documents } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TenantDetail = () => {
  const { id } = useParams();
  const [tenant, setTenant] = useState(tenants.find(t => t.id === id));
  
  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Tenant Not Found</h1>
        <p className="text-muted-foreground mb-6">The tenant you're looking for doesn't exist or has been removed.</p>
        <Link to="/tenants">
          <Button>Back to Tenants</Button>
        </Link>
      </div>
    );
  }

  // Get property info
  const property = properties.find(p => p.id === tenant.propertyId);
  
  // Get tenant payments
  const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
  
  // Get tenant maintenance requests
  const tenantMaintenance = maintenanceRequests.filter(m => m.tenantId === tenant.id);
  
  // Get tenant documents
  const tenantDocuments = documents.filter(d => d.tenantId === tenant.id);
  
  // Format date string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate lease progress
  const calculateLeaseProgress = () => {
    const today = new Date();
    const startDate = new Date(tenant.leaseStart);
    const endDate = new Date(tenant.leaseEnd);
    
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const daysElapsed = (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    
    const progress = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));
    
    return Math.round(progress);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/tenants">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{tenant.name}</h1>
            <Badge
              className={tenant.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
            >
              {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground ml-10">Tenant since {formatDate(tenant.leaseStart)}</p>
        </div>
        <div className="flex gap-2 ml-10 sm:ml-0">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button size="sm">
            <Banknote className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tenant Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{tenant.name}</h2>
                  <p className="text-sm text-muted-foreground">Primary Tenant</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <p>{tenant.email}</p>
                </div>
                <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <p>{tenant.phone}</p>
                </div>
                <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p>{property?.name}</p>
                    {tenant.unitNumber && (
                      <p className="text-sm text-muted-foreground">Unit {tenant.unitNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lease Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Lease Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lease Term</span>
                  <span className="font-medium">
                    {formatDate(tenant.leaseStart)} - {formatDate(tenant.leaseEnd)}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Lease Progress</span>
                    <span>{calculateLeaseProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${calculateLeaseProgress()}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Rent</span>
                  <span className="font-medium">${tenant.rentAmount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Security Deposit</span>
                  <span className="font-medium">${tenant.depositAmount}</span>
                </div>
                
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Current Balance</span>
                  {tenant.balance > 0 ? (
                    <span className="font-medium text-red-500">${tenant.balance}</span>
                  ) : (
                    <span className="font-medium text-green-500">Paid</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="payments">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {tenantPayments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No payment records found
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tenantPayments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{formatDate(payment.date)}</TableCell>
                              <TableCell>${payment.amount}</TableCell>
                              <TableCell className="capitalize">{payment.method.replace('-', ' ')}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={payment.status === 'completed' ? 'outline' : 'secondary'}
                                  className={payment.status === 'completed' 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' 
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200'
                                  }
                                >
                                  {payment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{payment.notes}</TableCell>
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
                  <CardTitle className="text-lg">Maintenance Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {tenantMaintenance.length === 0 ? (
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
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tenantMaintenance.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>{formatDate(request.dateSubmitted)}</TableCell>
                              <TableCell>
                                <div className="font-medium">{request.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">{request.description}</div>
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
                          ))}
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
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {tenantDocuments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No documents found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tenantDocuments.map((doc) => (
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
                                Uploaded on {formatDate(doc.uploadDate)} • {doc.fileSize} • {doc.fileType}
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

export default TenantDetail;
