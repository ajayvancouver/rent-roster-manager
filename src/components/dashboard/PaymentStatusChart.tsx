
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Payment, Tenant } from "@/types";

interface PaymentStatusChartProps {
  payments: Payment[];
  tenants: Tenant[];
}

const PaymentStatusChart = ({ payments, tenants }: PaymentStatusChartProps) => {
  // Calculate payment statuses
  const calculatePaymentData = () => {
    // Count tenants with different payment statuses
    const paidInFull = tenants.filter(tenant => tenant.balance === 0).length;
    const partialPayment = tenants.filter(tenant => tenant.balance > 0 && tenant.balance < tenant.rentAmount).length;
    const noPay = tenants.filter(tenant => tenant.balance === tenant.rentAmount).length;
    
    return [
      { name: "Paid in Full", value: paidInFull, color: "#4ade80" },
      { name: "Partial Payment", value: partialPayment, color: "#facc15" },
      { name: "No Payment", value: noPay, color: "#f87171" },
    ];
  };

  const [data] = useState(calculatePaymentData());

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle>Rent Payment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStatusChart;
