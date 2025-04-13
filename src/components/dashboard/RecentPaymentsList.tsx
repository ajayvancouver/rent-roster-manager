
import { Payment, Tenant } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecentPaymentsListProps {
  payments: Payment[];
  tenants: Tenant[];
}

const RecentPaymentsList = ({ payments, tenants }: RecentPaymentsListProps) => {
  // Get the 5 most recent payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get tenant name by ID
  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : "Unknown Tenant";
  };

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle>Recent Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentPayments.map(payment => (
            <div key={payment.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
              <div>
                <p className="font-medium text-sm">{getTenantName(payment.tenantId)}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">{formatDate(payment.date)}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground capitalize">{payment.method}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-semibold">${payment.amount.toLocaleString()}</span>
                <Badge variant="outline" className={getStatusColor(payment.status)}>
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPaymentsList;
