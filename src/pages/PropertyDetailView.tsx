
import { useParams } from "react-router-dom";
import { usePropertyManager } from "@/hooks/usePropertyManager";
import { usePropertyDetail } from "@/hooks/usePropertyDetail";
import PropertyHeader from "@/components/properties/PropertyHeader";
import PropertyImage from "@/components/properties/PropertyImage";
import PropertyInfoCard from "@/components/properties/PropertyInfoCard";
import TenantsList from "@/components/properties/TenantsList";
import PropertyDetailLoading from "@/components/properties/PropertyDetailLoading";

const PropertyDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const { properties, tenants: allTenants } = usePropertyManager();
  const { property, tenants, isLoading, occupancyRate } = usePropertyDetail(id, properties, allTenants);

  if (isLoading) {
    return <PropertyDetailLoading />;
  }

  if (!property) {
    return <div className="flex justify-center items-center h-64">Property not found</div>;
  }

  return (
    <div className="space-y-6">
      <PropertyHeader 
        name={property.name}
        address={property.address}
        city={property.city}
        state={property.state}
        zipCode={property.zipCode}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PropertyImage 
          image={property.image} 
          name={property.name} 
        />

        <PropertyInfoCard 
          type={property.type}
          units={property.units}
          occupancyRate={occupancyRate}
          tenantCount={tenants.length}
        />
      </div>

      <TenantsList 
        tenants={tenants}
        totalUnits={property.units}
      />
    </div>
  );
};

export default PropertyDetailView;
