
import React from "react";
import { Tenant } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TenantTable from "./TenantTable";

interface TenantTabsProps {
  activeTenants: Tenant[];
  inactiveTenants: Tenant[];
  allTenants: Tenant[];
  getPropertyName: (propertyId: string) => string;
  toggleSort: (field: keyof Tenant) => void;
  formatDate: (dateString: string) => string;
}

const TenantTabs: React.FC<TenantTabsProps> = ({
  activeTenants,
  inactiveTenants,
  allTenants,
  getPropertyName,
  toggleSort,
  formatDate
}) => {
  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList>
        <TabsTrigger value="active">Active Tenants</TabsTrigger>
        <TabsTrigger value="inactive">Inactive Tenants</TabsTrigger>
        <TabsTrigger value="all">All Tenants</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="mt-4">
        <TenantTable
          tenants={activeTenants}
          getPropertyName={getPropertyName}
          toggleSort={toggleSort}
          formatDate={formatDate}
        />
      </TabsContent>
      <TabsContent value="inactive" className="mt-4">
        <TenantTable
          tenants={inactiveTenants}
          getPropertyName={getPropertyName}
          toggleSort={toggleSort}
          formatDate={formatDate}
        />
      </TabsContent>
      <TabsContent value="all" className="mt-4">
        <TenantTable
          tenants={allTenants}
          getPropertyName={getPropertyName}
          toggleSort={toggleSort}
          formatDate={formatDate}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TenantTabs;
