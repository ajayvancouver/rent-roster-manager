
import { Calendar, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Payment } from "@/types";

interface PaymentsTableProps {
  payments: Payment[];
  isLoading: boolean;
  toggleSort: (field: keyof Payment) => void;
  getTenantName: (tenantId: string) => string;
  getPropertyInfo: (tenantId: string) => { name: string; unit: string };
  formatDate: (date: string) => string;
  getStatusColor: (status: Payment["status"]) => string;
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
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p>Loading payments data...</p>
      </div>
    );
  }

  return (
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
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                No payments found
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => {
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
  );
};

export default PaymentsTable;
