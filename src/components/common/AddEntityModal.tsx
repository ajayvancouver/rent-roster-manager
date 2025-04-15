
import React from "react";
import { DialogProps } from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

interface AddEntityModalProps extends DialogProps {
  title: string;
  children: React.ReactNode;
  onSave: () => void | Promise<void>;
  isLoading?: boolean;
}

const AddEntityModal = ({
  title,
  children,
  onSave,
  isLoading = false,
  ...props
}: AddEntityModalProps) => {
  const handleSave = () => {
    onSave();
  };

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-md border border-input bg-background p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="px-1">{children}</div>
        <DialogFooter>
          <Button variant="outline" type="button" asChild>
            <DialogClose>Cancel</DialogClose>
          </Button>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEntityModal;
