
import { useState, useEffect } from "react";
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
    if (!tenants || tenants.length === 0) {
      return [
        { name: "No Data", value: 1, color: "#e5e7eb" }
      ];
    }
    
    // Count tenants with different payment statuses
    const paidInFull = tenants.filter(tenant => tenant.balance === 0).length;
    const partialPayment = tenants.filter(tenant => tenant.balance > 0 && tenant.balance < tenant.rentAmount).length;
    const noPay = tenants.filter(tenant => tenant.balance === tenant.rentAmount).length;
    
    // If all values are 0, return a placeholder
    if (paidInFull === 0 && partialPayment === 0 && noPay === 0) {
      return [{ name: "No Data", value: 1, color: "#e5e7eb" }];
    }
    
    return [
      { name: "Paid in Full", value: paidInFull, color: "#4ade80" },
      { name: "Partial Payment", value: partialPayment, color: "#facc15" },
      { name: "No Payment", value: noPay, color: "#f87171" },
    ].filter(item => item.value > 0); // Only include non-zero values
  };

  const [data, setData] = useState(calculatePaymentData());
  
  // Recalculate when tenants or payments change
  useEffect(() => {
    setData(calculatePaymentData());
  }, [tenants, payments]);

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
