
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, MoreVertical } from "lucide-react";
import { Tenant } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditTenantForm from "./EditTenantForm";

interface TenantActionButtonsProps {
  tenant: Tenant;
  onView?: () => void;
  onEdit?: (data: Partial<Omit<Tenant, "id" | "propertyName" | "propertyAddress">>) => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
}

const TenantActionButtons = ({
  tenant,
  onView,
  onEdit,
  onDelete,
}: TenantActionButtonsProps) => {
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      navigate(`/tenants/${tenant.id}`);
    }
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleEditSubmit = async (data: Partial<Omit<Tenant, "id" | "propertyName" | "propertyAddress">>) => {
    if (!onEdit) return;

    setIsProcessing(true);
    try {
      const success = await onEdit(data);
      if (success) {
        setShowEditDialog(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;

    setIsProcessing(true);
    try {
      const success = await onDelete();
      if (success) {
        setShowDeleteDialog(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          {onEdit && (
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Tenant
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Tenant
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          <EditTenantForm
            tenant={tenant}
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
              This will permanently delete the tenant "{tenant.name}". This action cannot be undone.
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

export default TenantActionButtons;
