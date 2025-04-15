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
      type: item.type,
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
      type: data.type,
      units: data.units,
      image: data.image,
      managerId: data.manager_id
    };
  },

  async create(property: Omit<Property, "id">): Promise<any> {
    return await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();
  },

  async update(id: string, property: Partial<Property>): Promise<any> {
    return await supabase
      .from('properties')
      .update(property)
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
