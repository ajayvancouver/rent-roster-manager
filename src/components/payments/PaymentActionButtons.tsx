
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  CreditCard, 
  User, 
  Edit, 
  Trash2,
  Printer 
} from "lucide-react";
import { Payment } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { paymentsService } from "@/services/paymentsService";
import { useToast } from "@/hooks/use-toast";
import EditPaymentForm from "./EditPaymentForm";

interface PaymentActionButtonsProps {
  payment: Payment;
  onGenerateReceipt?: () => void;
  onRecordRelatedPayment?: () => void;
  onViewTenant?: () => void;
  onPaymentUpdated?: () => void;
  onPaymentDeleted?: () => void;
}

const PaymentActionButtons = ({
  payment,
  onGenerateReceipt,
  onRecordRelatedPayment,
  onViewTenant,
  onPaymentUpdated,
  onPaymentDeleted
}: PaymentActionButtonsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerateReceipt = () => {
    if (onGenerateReceipt) {
      onGenerateReceipt();
    } else {
      toast({
        title: "Receipt Generated",
        description: "The receipt has been generated successfully."
      });
    }
  };

  const handleRecordRelatedPayment = () => {
    if (onRecordRelatedPayment) {
      onRecordRelatedPayment();
    } else {
      navigate("/payments/new", { 
        state: { 
          tenantId: payment.tenantId,
          propertyId: payment.propertyId 
        } 
      });
    }
  };

  const handleViewTenant = () => {
    if (onViewTenant) {
      onViewTenant();
    } else if (payment.tenantId) {
      navigate(`/tenants/${payment.tenantId}`);
    }
  };

  const handleEditPayment = () => {
    setShowEditDialog(true);
  };

  const handleDeletePayment = () => {
    setShowDeleteDialog(true);
  };

  const handleEditSubmit = async (data: Partial<Payment>) => {
    setIsProcessing(true);
    try {
      // Extract fields that can be updated
      const updateData = {
        amount: data.amount,
        date: data.date,
        method: data.method,
        status: data.status,
        notes: data.notes,
        tenantId: data.tenantId
      };
      
      await paymentsService.update(payment.id, updateData);
      
      toast({
        title: "Payment Updated",
        description: "The payment has been updated successfully."
      });
      
      setShowEditDialog(false);
      
      if (onPaymentUpdated) {
        onPaymentUpdated();
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update the payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsProcessing(true);
    try {
      await paymentsService.delete(payment.id);
      
      toast({
        title: "Payment Deleted",
        description: "The payment has been deleted successfully."
      });
      
      setShowDeleteDialog(false);
      
      if (onPaymentDeleted) {
        onPaymentDeleted();
      } else {
        navigate("/payments");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Button className="w-full" variant="outline" onClick={handleGenerateReceipt}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Receipt
        </Button>
        
        <Button className="w-full" variant="outline" onClick={handleRecordRelatedPayment}>
          <CreditCard className="mr-2 h-4 w-4" />
          Record Related Payment
        </Button>
        
        <Button className="w-full" variant="outline" onClick={handleViewTenant}>
          <User className="mr-2 h-4 w-4" />
          View Tenant
        </Button>
        
        <Button className="w-full" variant="outline" onClick={handleEditPayment}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Payment
        </Button>
        
        <Button className="w-full" variant="destructive" onClick={handleDeletePayment}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Payment
        </Button>
      </div>

      {/* Edit Payment Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          <EditPaymentForm 
            payment={payment} 
            onSubmit={handleEditSubmit} 
            onCancel={() => setShowEditDialog(false)} 
            isProcessing={isProcessing}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the payment of ${payment.amount.toFixed(2)} 
              made on {new Date(payment.date).toLocaleDateString()}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PaymentActionButtons;
