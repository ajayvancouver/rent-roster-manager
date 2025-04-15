
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PropertyHeaderProps {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const PropertyHeader = ({ name, address, city, state, zipCode }: PropertyHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{name}</h1>
        <div className="flex items-center text-muted-foreground mt-1">
          <MapPin className="h-4 w-4 mr-1" />
          <p>{address}, {city}, {state} {zipCode}</p>
        </div>
      </div>
      <Button variant="outline" onClick={() => navigate('/properties')}>
        Back to Properties
      </Button>
    </div>
  );
};

export default PropertyHeader;
