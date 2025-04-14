
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PropertySearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewType: "grid" | "list";
  setViewType: (type: "grid" | "list") => void;
  onAddProperty: () => void;
}

const PropertySearch = ({ 
  searchQuery, 
  setSearchQuery, 
  viewType, 
  setViewType,
  onAddProperty
}: PropertySearchProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="relative grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search properties..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant={viewType === "grid" ? "default" : "outline"}
          onClick={() => setViewType("grid")}
          className="px-3"
        >
          Grid
        </Button>
        <Button
          variant={viewType === "list" ? "default" : "outline"}
          onClick={() => setViewType("list")}
          className="px-3"
        >
          List
        </Button>
        <Button onClick={onAddProperty}>
          <Plus className="mr-1 h-4 w-4" />
          Add Property
        </Button>
      </div>
    </div>
  );
};

export default PropertySearch;
