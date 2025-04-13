
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types";
import { propertiesService } from "./supabaseService";

/**
 * Creates sample properties for a manager
 * @param managerId - The ID of the property manager
 * @returns Array of created property IDs
 */
export const createSampleProperties = async (managerId: string): Promise<string[]> => {
  const sampleProperties: Omit<Property, "id">[] = [
    {
      name: "Oceanview Apartments",
      address: "123 Coastal Drive",
      city: "San Francisco",
      state: "CA",
      zipCode: "94110",
      units: 16,
      type: "apartment",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=500&auto=format&fit=crop",
      managerId
    },
    {
      name: "Hillside Townhomes",
      address: "456 Mountain View Road",
      city: "Denver",
      state: "CO",
      zipCode: "80202",
      units: 8,
      type: "duplex",
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=500&auto=format&fit=crop",
      managerId
    },
    {
      name: "Downtown Lofts",
      address: "789 Urban Street",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      units: 12,
      type: "apartment",
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=500&auto=format&fit=crop",
      managerId
    },
    {
      name: "Suburban Single Family",
      address: "101 Maple Avenue",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      units: 1,
      type: "house",
      image: "https://images.unsplash.com/photo-1598228723793-52759bba239c?q=80&w=500&auto=format&fit=crop",
      managerId
    }
  ];

  try {
    const createdPropertyIds: string[] = [];
    
    // Create each property sequentially
    for (const property of sampleProperties) {
      const createdProperty = await propertiesService.create(property);
      createdPropertyIds.push(createdProperty.id);
      console.log("Created sample property:", createdProperty.name);
    }
    
    return createdPropertyIds;
  } catch (error) {
    console.error("Error creating sample properties:", error);
    throw error;
  }
};

/**
 * Connect sample tenants to properties
 * @param managerId - The ID of the property manager
 * @param propertyIds - Array of property IDs to assign tenants to
 * @returns Success status
 */
export const connectSampleTenantsToProperties = async (managerId: string, propertyIds: string[]): Promise<boolean> => {
  if (propertyIds.length === 0) {
    console.error("No property IDs provided to connect tenants");
    return false;
  }

  try {
    // Fetch existing tenants that aren't assigned to properties yet
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id, name, email')
      .is('property_id', null)
      .eq('status', 'active');
    
    if (error) throw error;
    
    if (!tenants || tenants.length === 0) {
      console.log("No unassigned tenants found to connect to properties");
      return false;
    }
    
    // Assign tenants to properties
    const updates = tenants.map((tenant, index) => {
      // Distribute tenants across properties (cycling through propertyIds if needed)
      const propertyId = propertyIds[index % propertyIds.length];
      const unitNumber = `${Math.floor(Math.random() * 12) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`;
      
      return supabase
        .from('tenants')
        .update({ 
          property_id: propertyId,
          unit_number: unitNumber
        })
        .eq('id', tenant.id);
    });
    
    await Promise.all(updates);
    
    console.log(`Connected ${tenants.length} tenants to properties`);
    return true;
  } catch (error) {
    console.error("Error connecting tenants to properties:", error);
    return false;
  }
};
