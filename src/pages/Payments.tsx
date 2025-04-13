
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AddEntityModal from "@/components/common/AddEntityModal";
import AddPaymentForm from "@/components/payments/AddPaymentForm";
import { usePayments } from "@/hooks/usePayments";
import PaymentStats from "@/components/payments/PaymentStats";
import PaymentFilters from "@/components/payments/PaymentFilters";
import PaymentsTable from "@/components/payments/PaymentsTable";

const Payments = () => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const {
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
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
      <PaymentStats 
        totalAmount={totalAmount}
        completedAmount={completedAmount}
        pendingAmount={pendingAmount}
      />

      {/* Action Bar */}
      <PaymentFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onAddPayment={() => setShowAddModal(true)}
      />

      {/* Payments Table */}
      <PaymentsTable
        payments={sortedPayments}
        isLoading={isLoading}
        toggleSort={toggleSort}
        getTenantName={getTenantName}
        getPropertyInfo={getPropertyInfo}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
      />

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
