
import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, Banknote, ClipboardList } from "lucide-react";
import { Tenant } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface TenantTableProps {
  tenants: Tenant[];
  getPropertyName: (propertyId: string) => string;
  toggleSort: (field: keyof Tenant) => void;
  formatDate: (dateString: string) => string;
}

const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  getPropertyName,
  toggleSort,
  formatDate
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">
              <Button variant="ghost" className="p-0 h-8" onClick={() => toggleSort("name")}>
                Tenant Name <ArrowUpDown className="h-4 w-4 ml-1" />
              </Button>
            </TableHead>
            <TableHead>Property</TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8" onClick={() => toggleSort("rentAmount")}>
                Rent <ArrowUpDown className="h-4 w-4 ml-1" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8" onClick={() => toggleSort("balance")}>
                Balance <ArrowUpDown className="h-4 w-4 ml-1" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="p-0 h-8" onClick={() => toggleSort("leaseEnd")}>
                Lease End <ArrowUpDown className="h-4 w-4 ml-1" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No tenants found
              </TableCell>
            </TableRow>
          ) : (
            tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">
                  <div>
                    <Link to={`/tenants/${tenant.id}`} className="hover:underline">
                      {tenant.name}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-1">{tenant.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <Link to={`/properties/${tenant.propertyId}`} className="hover:underline">
                      {getPropertyName(tenant.propertyId)}
                    </Link>
                    {tenant.unitNumber && (
                      <div className="text-xs text-muted-foreground">Unit {tenant.unitNumber}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>${tenant.rentAmount}</TableCell>
                <TableCell>
                  {tenant.balance > 0 ? (
                    <Badge variant="destructive">${tenant.balance}</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Paid
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(tenant.leaseEnd)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" title="Record Payment">
                      <Banknote className="h-4 w-4" />
                    </Button>
                    <Link to={`/tenants/${tenant.id}`}>
                      <Button variant="outline" size="icon" title="View Details">
                        <ClipboardList className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TenantTable;
