
import { Building2, Users, Wallet, ClipboardCheck, AlertTriangle, LayoutPanelTop } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PaymentStatusChart from "@/components/dashboard/PaymentStatusChart";
import PropertyOccupancyCard from "@/components/dashboard/PropertyOccupancyCard";
import RentCollectionOverview from "@/components/dashboard/RentCollectionOverview";
import RecentPaymentsList from "@/components/dashboard/RecentPaymentsList";
import RecentMaintenanceList from "@/components/dashboard/RecentMaintenanceList";
import { usePropertyManager } from "@/hooks/usePropertyManager";
import { formatCurrency } from "@/utils/dataUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChartBuilder } from "@/components/dashboard/chart-builder/ChartBuilder";
import { useCustomCharts } from "@/hooks/useCustomCharts";
import { Separator } from "@/components/ui/separator";

const Dashboard = () => {
  const { 
    properties, 
    tenants, 
    payments, 
    maintenance, 
    documents,
    isLoading, 
    error, 
    stats
  } = usePropertyManager();

  const {
    customCharts,
    isBuilderVisible,
    toggleBuilder,
    saveCharts
  } = useCustomCharts();

  // Calculate open maintenance requests (pending or in-progress only)
  const openMaintenanceRequests = maintenance.filter(
    m => m.status === "pending" || m.status === "in-progress"
  ).length;

  // Display loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Loading your property management data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Display error state if data fetching failed
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">There was an error loading your data</p>
        </div>
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <h3 className="font-medium">Error Loading Data</h3>
          <p>Unable to load your property management data. Please try refreshing the page.</p>
          <p className="text-sm mt-2">{error.message || JSON.stringify(error)}</p>
        </div>
      </div>
    );
  }

  console.log('Dashboard data:', { 
    propertiesCount: properties.length,
    tenantsCount: tenants.length,
    paymentsCount: payments.length,
    maintenanceCount: maintenance.length,
    openMaintenanceCount: openMaintenanceRequests
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of your property management portfolio</p>
        </div>
        <Button 
          variant="outline" 
          onClick={toggleBuilder}
          className="flex items-center gap-2"
        >
          <LayoutPanelTop className="h-4 w-4" />
          {isBuilderVisible ? 'Hide Chart Builder' : 'Customize Dashboard'}
        </Button>
      </div>

      {/* Chart Builder */}
      {isBuilderVisible && (
        <>
          <ChartBuilder 
            savedCharts={customCharts} 
            onSaveCharts={saveCharts}
            properties={properties}
            tenants={tenants}
            payments={payments}
          />
          <Separator className="my-6" />
        </>
      )}

      {/* Custom Charts Area */}
      {customCharts.length > 0 && !isBuilderVisible && (
        <div 
          className="w-full min-h-[300px] border border-border rounded-lg p-4 relative my-6 bg-background/50"
          style={{ height: '400px' }}
        >
          {customCharts.map(chart => (
            <div
              key={chart.id}
              style={{
                position: 'absolute',
                left: `${chart.position.x}px`,
                top: `${chart.position.y}px`,
                width: `${chart.size.width}px`,
                height: `${chart.size.height}px`,
              }}
            >
              <iframe
                src={`/charts/${chart.id}`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title={chart.title}
              />
            </div>
          ))}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Properties"
          value={properties.length}
          icon={<Building2 className="h-5 w-5" />}
          description={`${properties.reduce((sum, p) => sum + p.units, 0)} Total Units`}
        />
        <StatCard
          title="Tenants"
          value={tenants.filter(t => t.status === 'active').length}
          icon={<Users className="h-5 w-5" />}
          description={`${stats.occupancyRate}% Occupancy Rate`}
        />
        <StatCard
          title="Rent Collection"
          value={formatCurrency(stats.totalRent)}
          icon={<Wallet className="h-5 w-5" />}
          description={`${stats.collectedRent > 0 ? Math.round((stats.collectedRent / stats.totalRent) * 100) : 0}% Collected`}
        />
        <StatCard
          title="Maintenance"
          value={openMaintenanceRequests}
          icon={<ClipboardCheck className="h-5 w-5" />}
          description="Open Requests"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PaymentStatusChart payments={payments} tenants={tenants} />
        <PropertyOccupancyCard properties={properties} tenants={tenants} />
      </div>

      {/* Data Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RentCollectionOverview tenants={tenants} payments={payments} />
        <div className="space-y-4">
          {stats.totalRent - stats.collectedRent > 0 && (
            <div className="flex p-4 text-amber-800 bg-amber-50 rounded-md">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <div>
                <h3 className="font-medium">Outstanding Balance</h3>
                <p className="text-sm">
                  There is {formatCurrency(stats.totalRent - stats.collectedRent)} in unpaid rent. Follow up with tenants.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecentPaymentsList payments={payments} tenants={tenants} />
        <RecentMaintenanceList maintenanceRequests={maintenance} />
      </div>
    </div>
  );
};

export default Dashboard;
