
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Maintenance } from "@/types";
import MaintenanceTable from "./MaintenanceTable";

interface MaintenanceTabsProps {
  openRequests: Maintenance[];
  closedRequests: Maintenance[];
  allRequests: Maintenance[];
  sortField: keyof Maintenance;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof Maintenance) => void;
  getTenantName: (tenantId: string) => string;
  getPropertyName: (propertyId: string) => string;
}

const MaintenanceTabs = ({
  openRequests,
  closedRequests,
  allRequests,
  sortField,
  sortDirection,
  onSort,
  getTenantName,
  getPropertyName
}: MaintenanceTabsProps) => {
  return (
    <Tabs defaultValue="open" className="w-full">
      <TabsList>
        <TabsTrigger value="open">Open Requests</TabsTrigger>
        <TabsTrigger value="closed">Closed Requests</TabsTrigger>
        <TabsTrigger value="all">All Requests</TabsTrigger>
      </TabsList>
      <TabsContent value="open" className="mt-4">
        <MaintenanceTable
          requests={openRequests}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
          getTenantName={getTenantName}
          getPropertyName={getPropertyName}
        />
      </TabsContent>
      <TabsContent value="closed" className="mt-4">
        <MaintenanceTable
          requests={closedRequests}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
          getTenantName={getTenantName}
          getPropertyName={getPropertyName}
        />
      </TabsContent>
      <TabsContent value="all" className="mt-4">
        <MaintenanceTable
          requests={allRequests}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
          getTenantName={getTenantName}
          getPropertyName={getPropertyName}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MaintenanceTabs;
