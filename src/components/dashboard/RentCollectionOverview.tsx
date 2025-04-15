
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Payment, Tenant } from "@/types";

interface RentCollectionOverviewProps {
  tenants: Tenant[];
  payments?: Payment[];
}

const RentCollectionOverview = ({ tenants, payments = [] }: RentCollectionOverviewProps) => {
  // Calculate total expected rent from all active tenants
  const totalExpectedRent = tenants
    .filter(tenant => tenant.status === 'active')
    .reduce((sum, tenant) => sum + (tenant.rentAmount || 0), 0);
  
  // Calculate total collected rent from payments
  const totalCollectedRent = payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  // Calculate collection rate (cap at 100% for display purposes)
  const collectionRate = totalExpectedRent > 0 
    ? Math.round((totalCollectedRent / totalExpectedRent) * 100)
    : 0;
  
  // Calculate the outstanding balance (can be positive or negative)
  const outstandingBalance = totalExpectedRent - totalCollectedRent;
  
  // Determine if we have an overpayment (more collected than expected)
  const isOverpaid = outstandingBalance < 0;
  
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
              <span className="font-medium">{collectionRate > 100 ? '100+' : collectionRate}%</span>
            </div>
            <Progress value={Math.min(collectionRate, 100)} className="h-2" />
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span>{isOverpaid ? 'Overpayment' : 'Outstanding Balance'}</span>
              <span className={`font-medium ${isOverpaid ? 'text-green-500' : 'text-red-500'}`}>
                {isOverpaid ? '+' : ''}{Math.abs(outstandingBalance).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RentCollectionOverview;
