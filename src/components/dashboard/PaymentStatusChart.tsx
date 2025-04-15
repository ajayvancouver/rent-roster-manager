
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Payment, Tenant } from "@/types";

interface PaymentStatusChartProps {
  payments: Payment[];
  tenants: Tenant[];
}

const PaymentStatusChart = ({ payments, tenants }: PaymentStatusChartProps) => {
  // Calculate payment statuses based on actual payments
  const calculatePaymentData = () => {
    // If no tenants or no payments, show "No Payment" data
    if (!tenants || tenants.length === 0) {
      return [
        { name: "No Payment", value: 1, color: "#f87171" }
      ];
    }
    
    // Get active tenants
    const activeTenants = tenants.filter(tenant => tenant.status === 'active');
    
    if (activeTenants.length === 0) {
      return [
        { name: "No Tenants", value: 1, color: "#9ca3af" }
      ];
    }
    
    // If no payments, all active tenants have "No Payment"
    if (!payments || payments.length === 0) {
      return [
        { name: "No Payment", value: activeTenants.length, color: "#f87171" }
      ];
    }
    
    // Count payments by tenant
    const completedPaymentsByTenant = new Set();
    payments.forEach(payment => {
      if (payment.status === 'completed') {
        completedPaymentsByTenant.add(payment.tenantId);
      }
    });
    
    // Count tenants with different payment statuses
    const paidInFull = completedPaymentsByTenant.size;
    const noPay = activeTenants.length - paidInFull;
    
    // Return data for chart
    const chartData = [];
    
    if (paidInFull > 0) {
      chartData.push({ name: "Paid", value: paidInFull, color: "#4ade80" });
    }
    
    if (noPay > 0) {
      chartData.push({ name: "No Payment", value: noPay, color: "#f87171" });
    }
    
    return chartData.length > 0 ? chartData : [{ name: "No Payment", value: 1, color: "#f87171" }];
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
