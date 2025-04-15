
import { Building2, Users, Wallet, ClipboardCheck, AlertTriangle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import PaymentStatusChart from "@/components/dashboard/PaymentStatusChart";
import PropertyOccupancyCard from "@/components/dashboard/PropertyOccupancyCard";
import RentCollectionOverview from "@/components/dashboard/RentCollectionOverview";
import RecentPaymentsList from "@/components/dashboard/RecentPaymentsList";
import RecentMaintenanceList from "@/components/dashboard/RecentMaintenanceList";
import { usePropertyManager } from "@/hooks/usePropertyManager";
import { formatCurrency } from "@/utils/dataUtils";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your property management portfolio</p>
      </div>

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
          value={maintenance.filter(m => m.status !== 'completed').length}
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
        <RentCollectionOverview tenants={tenants} />
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
