
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types";

/**
 * Generates sample tenants for a property
 * @param propertyId - The ID of the property to add tenants to
 * @returns Array of created tenant IDs
 */
export const generateSampleTenants = async (propertyId: string): Promise<string[]> => {
  try {
    const firstNames = ["James", "Robert", "John", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Emily", "Sarah", "Jessica", "Ashley", "Jennifer", "Amanda"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Chen"];
    
    // Generate 3-5 random tenants
    const count = Math.floor(Math.random() * 3) + 3;
    const createdTenantIds: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
      
      // Get property data to associate with manager
      const { data: property } = await supabase
        .from('properties')
        .select('manager_id')
        .eq('id', propertyId)
        .single();
      
      if (!property) {
        console.error("Property not found");
        continue;
      }
      
      // Create a unit number (1-20 with A-D suffix)
      const unitNumber = `${Math.floor(Math.random() * 20) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`;
      
      // Calculate random rent between $800-2500
      const rentAmount = Math.floor(Math.random() * 1700) + 800;
      
      // Create a lease with start date in the past 6 months and end date 1 year later
      const today = new Date();
      const startMonthsAgo = Math.floor(Math.random() * 6);
      const leaseStartDate = new Date(today);
      leaseStartDate.setMonth(today.getMonth() - startMonthsAgo);
      
      const leaseEndDate = new Date(leaseStartDate);
      leaseEndDate.setFullYear(leaseEndDate.getFullYear() + 1);
      
      const leaseStart = leaseStartDate.toISOString().split('T')[0];
      const leaseEnd = leaseEndDate.toISOString().split('T')[0];
      
      // Create tenant record
      const { data: tenant, error } = await supabase
        .from('tenants')
        .insert({
          name,
          email,
          phone: `(${Math.floor(Math.random() * 800) + 200}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          property_id: propertyId,
          unit_number: unitNumber,
          rent_amount: rentAmount,
          deposit_amount: rentAmount,
          lease_start: leaseStart,
          lease_end: leaseEnd,
          balance: Math.random() > 0.7 ? rentAmount : 0, // 30% chance of having a balance
          status: 'active',
          manager_id: property.manager_id
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating sample tenant:", error);
        continue;
      }
      
      if (tenant) {
        createdTenantIds.push(tenant.id);
      }
    }
    
    console.log(`Created ${createdTenantIds.length} sample tenants for property ${propertyId}`);
    return createdTenantIds;
    
  } catch (error) {
    console.error("Error generating sample tenants:", error);
    return [];
  }
};
