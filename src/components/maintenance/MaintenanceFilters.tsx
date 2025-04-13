
import { Search, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Maintenance } from "@/types";

interface MaintenanceFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priorityFilter: Maintenance["priority"] | "all";
  setPriorityFilter: (priority: Maintenance["priority"] | "all") => void;
  onAddRequest: () => void;
}

const MaintenanceFilters = ({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  onAddRequest
}: MaintenanceFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search maintenance requests..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Select
        value={priorityFilter}
        onValueChange={(value) => setPriorityFilter(value as Maintenance["priority"] | "all")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="emergency">Emergency</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={onAddRequest}>
        <PlusCircle className="h-4 w-4 mr-1" />
        New Request
      </Button>
    </div>
  );
};

export default MaintenanceFilters;
