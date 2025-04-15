
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Payment } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaymentsTableProps {
  payments: Payment[];
  isLoading: boolean;
  toggleSort: (field: string) => void;
  getTenantName: (tenantId: string) => string;
  getPropertyInfo: (tenantId: string) => { name: string | null; unit: string | null };
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
}

const PaymentsTable = ({
  payments,
  isLoading,
  toggleSort,
  getTenantName,
  getPropertyInfo,
  formatDate,
  getStatusColor,
}: PaymentsTableProps) => {
  console.log("Payments in table:", payments);

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <button
                onClick={() => toggleSort("date")}
                className="flex items-center gap-1"
              >
                Date
                <ChevronDown className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort("amount")}
                className="flex items-center gap-1"
              >
                Amount
                <ChevronDown className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Loading payments...
              </TableCell>
            </TableRow>
          ) : payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No payments found.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => {
              const property = getPropertyInfo(payment.tenantId);
              const tenantName = payment.tenantName || getTenantName(payment.tenantId);
              
              return (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {formatDate(payment.date)}
                  </TableCell>
                  <TableCell>{tenantName}</TableCell>
                  <TableCell>
                    {property.name} {property.unit ? `Unit ${property.unit}` : ""}
                  </TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{payment.method}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(getStatusColor(payment.status))}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/payments/${payment.id}`}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentsTable;
