
import React from "react";
import { Tenant } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TenantTable, { TenantTableSkeleton } from "./TenantTable";
import { Badge } from "@/components/ui/badge";

interface TenantTabsProps {
  activeTenants: Tenant[];
  inactiveTenants: Tenant[];
  allTenants: Tenant[];
  getPropertyName: (propertyId: string) => string;
  toggleSort: (field: string) => void;
  formatDate: (date: string) => string;
  onEditTenant?: (id: string, data: Partial<Omit<Tenant, "id" | "propertyName" | "propertyAddress">>) => Promise<boolean>;
  onDeleteTenant?: (id: string) => Promise<boolean>;
}

const TenantTabs = ({
  activeTenants,
  inactiveTenants,
  allTenants,
  getPropertyName,
  toggleSort,
  formatDate,
  onEditTenant,
  onDeleteTenant
}: TenantTabsProps) => {
  return (
    <Tabs defaultValue="all">
      <TabsList className="flex mb-6">
        <TabsTrigger value="all" className="flex-1">
          All Tenants <Badge className="ml-2" variant="outline">{allTenants.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="active" className="flex-1">
          Active <Badge className="ml-2" variant="outline">{activeTenants.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="inactive" className="flex-1">
          Inactive <Badge className="ml-2" variant="outline">{inactiveTenants.length}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <TenantTable 
          tenants={allTenants} 
          getPropertyName={getPropertyName} 
          formatDate={formatDate} 
          onSort={toggleSort}
          onEditTenant={onEditTenant}
          onDeleteTenant={onDeleteTenant}
        />
      </TabsContent>

      <TabsContent value="active">
        <TenantTable 
          tenants={activeTenants} 
          getPropertyName={getPropertyName} 
          formatDate={formatDate}
          onSort={toggleSort}
          onEditTenant={onEditTenant}
          onDeleteTenant={onDeleteTenant}
        />
      </TabsContent>

      <TabsContent value="inactive">
        <TenantTable 
          tenants={inactiveTenants} 
          getPropertyName={getPropertyName} 
          formatDate={formatDate}
          onSort={toggleSort}
          onEditTenant={onEditTenant}
          onDeleteTenant={onDeleteTenant}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TenantTabs;
