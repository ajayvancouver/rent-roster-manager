import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types";

export const propertiesService = {
  async getAll(managerId?: string): Promise<Property[]> {
    try {
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
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
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
  }
};
