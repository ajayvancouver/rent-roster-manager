
import React from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TenantSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
}

const TenantSearchBar: React.FC<TenantSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onAddClick
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tenants..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button onClick={onAddClick}>
        <Plus className="mr-1 h-4 w-4" />
        Add Tenant
      </Button>
    </div>
  );
};

export default TenantSearchBar;
