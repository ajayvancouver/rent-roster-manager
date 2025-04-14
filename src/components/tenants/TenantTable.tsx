
import React from "react";
import { Tenant } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TenantActionButtons from "./TenantActionButtons";

interface TenantTableProps {
  tenants: Tenant[];
  getPropertyName: (propertyId: string) => string;
  formatDate: (date: string) => string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
  onEditTenant?: (id: string, data: Partial<Omit<Tenant, "id" | "propertyName" | "propertyAddress">>) => Promise<boolean>;
  onDeleteTenant?: (id: string) => Promise<boolean>;
}

const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  getPropertyName,
  formatDate,
  sortField,
  sortDirection,
  onSort,
  onEditTenant,
  onDeleteTenant
}) => {
  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  const handleHeaderClick = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  if (tenants.length === 0) {
    return <p className="text-center py-4 text-muted-foreground">No tenants found.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className={onSort ? "cursor-pointer" : ""} 
              onClick={() => handleHeaderClick("name")}
            >
              Name{renderSortIndicator("name")}
            </TableHead>
            <TableHead 
              className={onSort ? "cursor-pointer" : ""} 
              onClick={() => handleHeaderClick("property")}
            >
              Property{renderSortIndicator("property")}
            </TableHead>
            <TableHead 
              className={onSort ? "cursor-pointer" : ""} 
              onClick={() => handleHeaderClick("leaseEnd")}
            >
              Lease End{renderSortIndicator("leaseEnd")}
            </TableHead>
            <TableHead 
              className={onSort ? "cursor-pointer" : ""} 
              onClick={() => handleHeaderClick("rentAmount")}
              className="text-right"
            >
              Rent{renderSortIndicator("rentAmount")}
            </TableHead>
            <TableHead 
              className={onSort ? "cursor-pointer" : ""} 
              onClick={() => handleHeaderClick("status")}
            >
              Status{renderSortIndicator("status")}
            </TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell>
                <div className="font-medium">{tenant.name}</div>
                <div className="text-sm text-muted-foreground">{tenant.email}</div>
              </TableCell>
              <TableCell>
                {tenant.propertyId ? (
                  <>
                    <div>{getPropertyName(tenant.propertyId)}</div>
                    {tenant.unitNumber && (
                      <div className="text-sm text-muted-foreground">Unit: {tenant.unitNumber}</div>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </TableCell>
              <TableCell>{formatDate(tenant.leaseEnd)}</TableCell>
              <TableCell className="text-right">${tenant.rentAmount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    tenant.status === "active"
                      ? "success"
                      : tenant.status === "pending"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <TenantActionButtons 
                  tenant={tenant}
                  onEdit={onEditTenant ? data => onEditTenant(tenant.id, data) : undefined}
                  onDelete={onDeleteTenant ? () => onDeleteTenant(tenant.id) : undefined}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const TenantTableSkeleton = () => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Property</TableHead>
          <TableHead>Lease End</TableHead>
          <TableHead className="text-right">Rent</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32 mt-1" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-28" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-24" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-6 w-16 ml-auto" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-8" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default TenantTable;
