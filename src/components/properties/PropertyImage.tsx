
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PropertyImageProps {
  image?: string;
  name: string;
}

const PropertyImage = ({ image, name }: PropertyImageProps) => {
  return (
    <Card className="md:col-span-2">
      <CardContent className="p-6">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-64 object-cover rounded-md" 
          />
        ) : (
          <div className="w-full h-64 bg-muted flex items-center justify-center rounded-md">
            <Building2 className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyImage;
