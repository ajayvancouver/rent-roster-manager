
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types";

export const propertiesService = {
  async getAll(managerId?: string): Promise<Property[]> {
    console.log("Getting properties with managerId:", managerId);
    
    // The query will be filtered by RLS policies based on the authenticated user
    const { data, error } = await supabase
      .from('properties')
      .select('*');
    
    if (error) {
      console.error("Error fetching properties:", error);
      throw error;
    }
    
    console.log("Raw properties data from Supabase:", data);
    console.log("Number of properties fetched:", data?.length || 0);
    
    if (!data || data.length === 0) {
      console.warn("No properties found in database or query returned empty result");
    }
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      address: item.address,
      city: item.city,
      state: item.state,
      zipCode: item.zip_code,
      type: item.type as 'apartment' | 'house' | 'duplex' | 'commercial',
      units: item.units,
      image: item.image,
      managerId: item.manager_id
    }));
  },

  async getById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      type: data.type as 'apartment' | 'house' | 'duplex' | 'commercial',
      units: data.units,
      image: data.image,
      managerId: data.manager_id
    };
  },

  async create(property: Omit<Property, "id">): Promise<any> {
    // Convert our frontend property model to database schema
    const dbProperty = {
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      zip_code: property.zipCode,
      type: property.type,
      units: property.units,
      image: property.image,
      manager_id: property.managerId
    };
    
    return await supabase
      .from('properties')
      .insert(dbProperty)
      .select()
      .single();
  },

  async update(id: string, property: Partial<Property>): Promise<any> {
    // Convert our frontend property model to database schema
    const dbProperty: any = {};
    
    if (property.name !== undefined) dbProperty.name = property.name;
    if (property.address !== undefined) dbProperty.address = property.address;
    if (property.city !== undefined) dbProperty.city = property.city;
    if (property.state !== undefined) dbProperty.state = property.state;
    if (property.zipCode !== undefined) dbProperty.zip_code = property.zipCode;
    if (property.type !== undefined) dbProperty.type = property.type;
    if (property.units !== undefined) dbProperty.units = property.units;
    if (property.image !== undefined) dbProperty.image = property.image;
    if (property.managerId !== undefined) dbProperty.manager_id = property.managerId;
    
    return await supabase
      .from('properties')
      .update(dbProperty)
      .eq('id', id)
      .select()
      .single();
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
