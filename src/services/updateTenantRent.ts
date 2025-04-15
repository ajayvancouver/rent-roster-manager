
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const updateTenantRent = async (tenantId: string, newRentAmount: number) => {
  try {
    console.log(`Updating rent amount for tenant ${tenantId} to $${newRentAmount}`);
    
    const { data, error } = await supabase
      .from('tenants')
      .update({ rent_amount: newRentAmount })
      .eq('id', tenantId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating tenant rent:", error);
      throw error;
    }
    
    console.log("Rent update successful:", data);
    return data;
  } catch (error) {
    console.error("Error in updateTenantRent:", error);
    throw error;
  }
};

export const updateTenantRentByEmail = async (email: string, newRentAmount: number) => {
  try {
    console.log(`Updating rent amount for tenant with email ${email} to $${newRentAmount}`);
    
    const { data, error } = await supabase
      .from('tenants')
      .update({ rent_amount: newRentAmount })
      .eq('email', email)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating tenant rent by email:", error);
      throw error;
    }
    
    console.log("Rent update successful:", data);
    return data;
  } catch (error) {
    console.error("Error in updateTenantRentByEmail:", error);
    throw error;
  }
};
