
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CheckCircle2, AlertCircle } from "lucide-react";

interface PaymentStatsProps {
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
}

const PaymentStats = ({ totalAmount, completedAmount, pendingAmount }: PaymentStatsProps) => {
  // Format with commas but avoid displaying NaN or undefined
  const formatAmount = (amount: number) => {
    return isNaN(amount) ? "$0" : `$${amount.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
              <h3 className="text-2xl font-bold">{formatAmount(totalAmount)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 text-green-600 mr-4">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <h3 className="text-2xl font-bold">{formatAmount(completedAmount)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <h3 className="text-2xl font-bold">{formatAmount(pendingAmount)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStats;
