
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates sample properties for a new manager account
 * @param managerId The ID of the manager to create sample properties for
 * @returns An array of created property IDs
 */
export const createSampleProperties = async (managerId: string): Promise<string[]> => {
  console.log("Creating sample properties for manager:", managerId);
  
  const sampleProperties = [
    {
      name: "Sunset Apartments",
      address: "123 Sunset Blvd",
      city: "Los Angeles",
      state: "CA",
      zip_code: "90210",
      type: "apartment",
      units: 12,
      manager_id: managerId,
      image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      name: "Lakeside Villas",
      address: "456 Lake View Dr",
      city: "Chicago",
      state: "IL",
      zip_code: "60601",
      type: "condo",
      units: 8,
      manager_id: managerId,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
      name: "Mountain Retreat",
      address: "789 Alpine Way",
      city: "Denver",
      state: "CO",
      zip_code: "80202",
      type: "house",
      units: 1,
      manager_id: managerId,
      image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    }
  ];

  try {
    const { data, error } = await supabase
      .from('properties')
      .insert(sampleProperties)
      .select('id');
    
    if (error) {
      console.error("Error creating sample properties:", error.message);
      throw error;
    }
    
    console.log("Created sample properties:", data);
    return data.map(prop => prop.id);
  } catch (error) {
    console.error("Error in createSampleProperties:", error);
    throw error;
  }
};

/**
 * Connect sample tenants to the newly created properties
 * @param managerId The ID of the manager
 * @param propertyIds Array of property IDs to connect tenants to
 */
export const connectSampleTenantsToProperties = async (managerId: string, propertyIds: string[]): Promise<void> => {
  console.log("Connecting sample tenants to properties for manager:", managerId);
  
  if (!propertyIds.length) {
    console.warn("No property IDs provided for connecting sample tenants");
    return;
  }
  
  // Find available tenants that don't have a property assigned yet
  const { data: availableTenants, error: tenantError } = await supabase
    .from('tenants')
    .select('id, email, name')
    .is('property_id', null)
    .limit(propertyIds.length * 2); // Get twice as many tenants as properties
  
  if (tenantError) {
    console.error("Error fetching available tenants:", tenantError);
    throw tenantError;
  }
  
  if (!availableTenants || availableTenants.length === 0) {
    console.log("No available tenants found to connect to properties");
    return;
  }
  
  console.log(`Found ${availableTenants.length} available tenants to connect to properties`);
  
  // Create a queue of tenants to assign to properties
  const tenantQueue = [...availableTenants];
  const updates = [];
  
  // For each property, assign up to 2 tenants
  for (const propertyId of propertyIds) {
    for (let i = 0; i < 2; i++) {
      if (tenantQueue.length === 0) break;
      
      const tenant = tenantQueue.shift();
      const unitNumber = `${10 + i}${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`; // e.g., 10A, 10B, 11A, etc.
      
      updates.push({
        id: tenant.id,
        property_id: propertyId,
        unit_number: unitNumber,
        rent_amount: 1000 + Math.floor(Math.random() * 500), // Random rent between 1000-1500
        deposit_amount: 1000, // Fixed deposit
        lease_start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
        lease_end: new Date(new Date().setMonth(new Date().getMonth() + 9)).toISOString().split('T')[0],
      });
    }
  }
  
  if (updates.length === 0) {
    console.log("No tenant updates to make");
    return;
  }
  
  // Update the tenants with property assignments
  const { data: updatedTenants, error: updateError } = await supabase
    .from('tenants')
    .upsert(updates)
    .select('id, name, property_id, unit_number');
  
  if (updateError) {
    console.error("Error connecting tenants to properties:", updateError);
    throw updateError;
  }
  
  console.log(`Successfully connected ${updatedTenants.length} tenants to properties`);
};

/**
 * Creates sample tenants for the newly created properties
 * @param managerId The ID of the manager
 * @param propertyIds Array of property IDs to create tenants for
 */
export const createSampleTenants = async (managerId: string, propertyIds: string[]): Promise<void> => {
  console.log("Creating sample tenants for properties:", propertyIds);

  if (!propertyIds.length) {
    console.warn("No property IDs provided for creating sample tenants");
    return;
  }

  const sampleTenants = [
    {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "555-123-4567",
      property_id: propertyIds[0],
      unit_number: "101",
      rent_amount: 1200,
      deposit_amount: 1200,
      lease_start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
      lease_end: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
      status: "active"
    },
    {
      name: "Emma Johnson",
      email: "emma.johnson@example.com",
      phone: "555-987-6543",
      property_id: propertyIds[0],
      unit_number: "202",
      rent_amount: 1300,
      deposit_amount: 1300,
      lease_start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
      lease_end: new Date(new Date().setMonth(new Date().getMonth() + 9)).toISOString().split('T')[0],
      status: "active"
    }
  ];

  if (propertyIds.length > 1) {
    sampleTenants.push({
      name: "Michael Brown",
      email: "michael.brown@example.com",
      phone: "555-456-7890",
      property_id: propertyIds[1],
      unit_number: "101",
      rent_amount: 1500,
      deposit_amount: 1500,
      lease_start: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString().split('T')[0],
      lease_end: new Date(new Date().setMonth(new Date().getMonth() + 10)).toISOString().split('T')[0],
      status: "active"
    });
  }

  try {
    const { data, error } = await supabase
      .from('tenants')
      .insert(sampleTenants)
      .select('id');
    
    if (error) {
      console.error("Error creating sample tenants:", error.message);
      throw error;
    }
    
    console.log("Created sample tenants:", data);
    
    // Create some sample payments for these tenants
    await createSamplePayments(data.map(tenant => tenant.id));
    
    // Create some sample maintenance requests
    await createSampleMaintenance(propertyIds[0], data[0].id);
  } catch (error) {
    console.error("Error in createSampleTenants:", error);
    throw error;
  }
};

/**
 * Creates sample payments for the provided tenants
 * @param tenantIds Array of tenant IDs to create payments for
 */
const createSamplePayments = async (tenantIds: string[]): Promise<void> => {
  console.log("Creating sample payments for tenants:", tenantIds);
  
  if (!tenantIds.length) {
    return;
  }
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const samplePayments = [];
  
  // Create 3 months of payment history for each tenant
  for (const tenantId of tenantIds) {
    for (let i = 2; i >= 0; i--) {
      const paymentMonth = new Date(currentYear, currentMonth - i, 1);
      
      samplePayments.push({
        tenant_id: tenantId,
        amount: 1200 + Math.floor(Math.random() * 300),
        date: paymentMonth.toISOString().split('T')[0],
        method: i === 0 ? "credit_card" : ["check", "bank_transfer", "cash"][Math.floor(Math.random() * 3)],
        status: "completed",
        notes: `Rent payment for ${paymentMonth.toLocaleString('default', { month: 'long' })} ${paymentMonth.getFullYear()}`
      });
    }
  }
  
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert(samplePayments);
    
    if (error) {
      console.error("Error creating sample payments:", error.message);
      throw error;
    }
    
    console.log("Created sample payments successfully");
  } catch (error) {
    console.error("Error in createSamplePayments:", error);
    throw error;
  }
};

/**
 * Creates sample maintenance requests for a property
 * @param propertyId Property ID to create maintenance requests for
 * @param tenantId Tenant ID to associate with the requests
 */
const createSampleMaintenance = async (propertyId: string, tenantId: string): Promise<void> => {
  console.log("Creating sample maintenance requests for property:", propertyId);
  
  const sampleRequests = [
    {
      title: "Leaking Faucet",
      description: "The kitchen faucet is leaking and needs to be repaired.",
      priority: "medium",
      status: "completed",
      property_id: propertyId,
      tenant_id: tenantId,
      date_submitted: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      date_completed: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(),
      cost: 75
    },
    {
      title: "Broken AC",
      description: "The air conditioning unit is not cooling properly.",
      priority: "high",
      status: "in-progress",
      property_id: propertyId,
      tenant_id: tenantId,
      date_submitted: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      assigned_to: "HVAC Specialist"
    },
    {
      title: "Light Bulb Replacement",
      description: "The hallway light bulb needs to be replaced.",
      priority: "low",
      status: "pending",
      property_id: propertyId,
      tenant_id: tenantId,
      date_submitted: new Date().toISOString()
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('maintenance')
      .insert(sampleRequests);
    
    if (error) {
      console.error("Error creating sample maintenance requests:", error.message);
      throw error;
    }
    
    console.log("Created sample maintenance requests successfully");
  } catch (error) {
    console.error("Error in createSampleMaintenance:", error);
    throw error;
  }
};

/**
 * Main function to create all sample data for a new manager
 * @param managerId The ID of the manager to create sample data for
 */
export const createSamplePropertyManager = async (managerId: string): Promise<void> => {
  try {
    console.log("Creating sample data for manager:", managerId);
    
    // Step 1: Create sample properties for this manager
    const propertyIds = await createSampleProperties(managerId);
    
    // Step 2: Create sample tenants for these properties
    await createSampleTenants(managerId, propertyIds);
    
    console.log("Sample data creation completed for manager:", managerId);
  } catch (error) {
    console.error("Error creating sample property manager data:", error);
    throw error;
  }
};
