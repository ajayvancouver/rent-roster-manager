
import { Search, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Payment } from "@/types";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useState } from "react";

interface PaymentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: Payment["status"] | "all";
  setStatusFilter: (status: Payment["status"] | "all") => void;
  onAddPayment: () => void;
  dateRange?: { from: Date | undefined; to: Date | undefined };
  setDateRange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

const PaymentFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onAddPayment,
  dateRange,
  setDateRange,
}: PaymentFiltersProps) => {
  const [showDateFilter, setShowDateFilter] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search payments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as any)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setShowDateFilter(!showDateFilter)}>
          <Calendar className="mr-2 h-4 w-4" />
          Date Filter
        </Button>
        <Button onClick={onAddPayment}>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>
      
      {showDateFilter && dateRange && setDateRange && (
        <div className="pt-2">
          <DateRangePicker
            date={dateRange}
            setDate={setDateRange}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentFilters;
