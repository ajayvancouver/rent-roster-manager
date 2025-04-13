
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserMinus } from "lucide-react";
import { Tenant } from "@/types";

interface TenantSummaryCardsProps {
  tenants: Tenant[];
}

const TenantSummaryCards: React.FC<TenantSummaryCardsProps> = ({ tenants }) => {
  const activeCount = tenants.filter(t => t.status === "active").length;
  const inactiveCount = tenants.filter(t => t.status !== "active").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
              <h3 className="text-2xl font-bold">{tenants.length}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 text-green-600 mr-4">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Leases</p>
              <h3 className="text-2xl font-bold">{activeCount}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100 text-red-600 mr-4">
              <UserMinus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inactive Tenants</p>
              <h3 className="text-2xl font-bold">{inactiveCount}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantSummaryCards;
