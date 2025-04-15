
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tenant } from "@/types";

interface RentCollectionOverviewProps {
  tenants: Tenant[];
}

const RentCollectionOverview = ({ tenants }: RentCollectionOverviewProps) => {
  // Calculate total rent data
  const totalExpectedRent = tenants.reduce(
    (sum, tenant) => sum + tenant.rentAmount, 
    0
  );
  
  const totalCollectedRent = tenants.reduce(
    (sum, tenant) => sum + (tenant.rentAmount - tenant.balance), 
    0
  );
  
  const collectionRate = totalExpectedRent > 0 
    ? Math.round((totalCollectedRent / totalExpectedRent) * 100)
    : 0;
  
  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle>Rent Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium">Total Expected</p>
              <p className="text-xl font-bold">${totalExpectedRent.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Total Collected</p>
              <p className="text-xl font-bold">${totalCollectedRent.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Collection Rate</span>
              <span className="font-medium">{collectionRate}%</span>
            </div>
            <Progress value={collectionRate} className="h-2" />
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span>Outstanding Balance</span>
              <span className="font-medium text-red-500">
                ${(totalExpectedRent - totalCollectedRent).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RentCollectionOverview;
