
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types";

export const propertiesService = {
  async getAll(managerId?: string): Promise<Property[]> {
    try {
      console.log("Fetching properties with managerId:", managerId);
      
      let query = supabase.from('properties').select('*');
      
      // Filter by manager_id if provided
      if (managerId) {
        query = query.eq('manager_id', managerId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
      
      console.log("Raw properties data from Supabase:", data);
      console.log("Number of properties fetched:", data?.length || 0);
      
      if (!data || data.length === 0) {
        console.warn("No properties found in database or query returned empty result");
      }
      
      // Map database columns to our TypeScript interfaces with proper type casting
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        address: item.address,
        city: item.city,
        state: item.state,
        zipCode: item.zip_code, 
        units: item.units,
        type: item.type as 'apartment' | 'house' | 'duplex' | 'commercial', // Cast to correct union type
        image: item.image || undefined,
        managerId: item.manager_id
      }));
    } catch (error) {
      console.error("Error in propertiesService.getAll:", error);
      return [];
    }
  },

  async getById(id: string): Promise<Property | null> {
    try {
      console.log("Fetching property by ID:", id);
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching property by ID:", error);
        throw error;
      }
      
      if (!data) {
        console.warn("No property found with ID:", id);
        return null;
      }
      
      console.log("Found property:", data);
      
      // Map to our TypeScript interface with proper type casting
      return {
        id: data.id,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zip_code,
        units: data.units,
        type: data.type as 'apartment' | 'house' | 'duplex' | 'commercial', // Cast to correct union type
        image: data.image || undefined,
        managerId: data.manager_id
      };
    } catch (error) {
      console.error("Error in propertiesService.getById:", error);
      return null;
    }
  },

  async create(property: Omit<Property, 'id'>): Promise<Property> {
    // Map our TypeScript interface to database columns
    const dbProperty = {
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      zip_code: property.zipCode, // Map zipCode to zip_code
      units: property.units,
      type: property.type,
      image: property.image,
      manager_id: property.managerId
    };
    
    const { data, error } = await supabase
      .from('properties')
      .insert(dbProperty)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map the response back to our TypeScript interface with proper type casting
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      units: data.units,
      type: data.type as 'apartment' | 'house' | 'duplex' | 'commercial', // Cast to correct union type
      image: data.image || undefined,
      managerId: data.manager_id
    };
  },

  async update(id: string, property: Partial<Omit<Property, 'id'>>): Promise<Property | null> {
    // Map our TypeScript interface to database columns
    const dbProperty: any = {};
    
    if (property.name !== undefined) dbProperty.name = property.name;
    if (property.address !== undefined) dbProperty.address = property.address;
    if (property.city !== undefined) dbProperty.city = property.city;
    if (property.state !== undefined) dbProperty.state = property.state;
    if (property.zipCode !== undefined) dbProperty.zip_code = property.zipCode;
    if (property.units !== undefined) dbProperty.units = property.units;
    if (property.type !== undefined) dbProperty.type = property.type;
    if (property.image !== undefined) dbProperty.image = property.image;
    if (property.managerId !== undefined) dbProperty.manager_id = property.managerId;
    
    const { data, error } = await supabase
      .from('properties')
      .update(dbProperty)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating property:", error);
      throw error;
    }
    
    if (!data) return null;
    
    // Map the response back to our TypeScript interface
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      units: data.units,
      type: data.type as 'apartment' | 'house' | 'duplex' | 'commercial',
      image: data.image || undefined,
      managerId: data.manager_id
    };
  },
  
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting property:", error);
      throw error;
    }
    
    return true;
  }
};
