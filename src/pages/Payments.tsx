
import { useState } from "react";
import { Calendar, ArrowUpDown, Search, DollarSign, CheckCircle2, XCircle, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import AddEntityModal from "@/components/common/AddEntityModal";
import AddPaymentForm from "@/components/payments/AddPaymentForm";
import { usePayments } from "@/hooks/usePayments";

const Payments = () => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const {
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    toggleSort,
    getTenantName,
    getPropertyInfo,
    getSortedPayments,
    formatDate,
    getStatusColor,
    handleAddPayment,
    totalAmount,
    completedAmount,
    pendingAmount
  } = usePayments();

  const sortedPayments = getSortedPayments();

  // Handle adding a payment
  const onAddPaymentSuccess = async () => {
    setShowAddModal(false);
    toast({
      title: "Success",
      description: "Payment has been recorded successfully."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-2">Track and manage rent payments</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                <h3 className="text-2xl font-bold">${totalAmount.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-4">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <h3 className="text-2xl font-bold">${completedAmount.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h3 className="text-2xl font-bold">${pendingAmount.toLocaleString()}</h3>
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
            placeholder="Search payments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as any)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <p>Loading payments data...</p>
        </div>
      ) : (
        // Payments Table
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Tenant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 h-8" onClick={() => toggleSort("date")}>
                    Date <ArrowUpDown className="h-4 w-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 h-8" onClick={() => toggleSort("amount")}>
                    Amount <ArrowUpDown className="h-4 w-4 ml-1" />
                  </Button>
                </TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                sortedPayments.map((payment) => {
                  const propertyInfo = getPropertyInfo(payment.tenantId);
                  
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {getTenantName(payment.tenantId)}
                      </TableCell>
                      <TableCell>
                        <div>
                          {propertyInfo.name}
                          {propertyInfo.unit && (
                            <div className="text-xs text-muted-foreground">{propertyInfo.unit}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell className="font-semibold">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{payment.method}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {payment.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Payment Modal */}
      <AddEntityModal
        title="Record New Payment"
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={onAddPaymentSuccess}
      >
        <AddPaymentForm onSuccess={onAddPaymentSuccess} />
      </AddEntityModal>
    </div>
  );
};

export default Payments;
