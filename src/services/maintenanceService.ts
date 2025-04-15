import { supabase } from "@/integrations/supabase/client";
import { Maintenance } from "@/types";

export const maintenanceService = {
  async getAll(managerId?: string): Promise<Maintenance[]> {
    let query = supabase
      .from('maintenance')
      .select('*, properties(name, manager_id), tenants(name, email, unit_number)');
    
    if (managerId) {
      query = query.eq('properties.manager_id', managerId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      propertyId: item.property_id,
      propertyName: item.properties ? item.properties.name : 'Unknown',
      tenantId: item.tenant_id,
      tenantName: item.tenants ? item.tenants.name : 'Unknown Tenant',
      tenantEmail: item.tenants ? item.tenants.email : null,
      unitNumber: item.tenants ? item.tenants.unit_number : null,
      title: item.title,
      description: item.description,
      priority: item.priority as 'low' | 'medium' | 'high' | 'emergency',
      status: item.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
      dateSubmitted: item.date_submitted,
      dateCompleted: item.date_completed || undefined,
      assignedTo: item.assigned_to || undefined,
      cost: item.cost || undefined,
      managerId: item.properties?.manager_id
    }));
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*, properties(name), tenants(name, email, unit_number)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching maintenance request:", error);
      return { data: null, error };
    }
    
    if (!data) {
      return { data: null, error: null };
    }
    
    const maintenance: Maintenance = {
      id: data.id,
      propertyId: data.property_id,
      propertyName: data.properties ? data.properties.name : 'Unknown',
      tenantId: data.tenant_id || undefined,
      tenantName: data.tenants ? data.tenants.name : 'Unknown Tenant',
      tenantEmail: data.tenants ? data.tenants.email : null,
      unitNumber: data.tenants ? data.tenants.unit_number : null,
      title: data.title,
      description: data.description,
      priority: data.priority as 'low' | 'medium' | 'high' | 'emergency',
      status: data.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
      dateSubmitted: data.date_submitted,
      dateCompleted: data.date_completed || undefined,
      assignedTo: data.assigned_to || undefined,
      cost: data.cost || undefined
    };
    
    return { data: maintenance, error: null };
  },

  async getByTenantId(tenantId: string): Promise<Maintenance[]> {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*, properties(name)')
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      propertyId: item.property_id,
      propertyName: item.properties ? item.properties.name : 'Unknown',
      tenantId: item.tenant_id,
      title: item.title,
      description: item.description,
      priority: item.priority as 'low' | 'medium' | 'high' | 'emergency',
      status: item.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
      dateSubmitted: item.date_submitted,
      dateCompleted: item.date_completed || undefined,
      assignedTo: item.assigned_to || undefined,
      cost: item.cost || undefined
    }));
  },

  async getByPropertyId(propertyId: string): Promise<Maintenance[]> {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*, tenants(name, email, unit_number)')
      .eq('property_id', propertyId);
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      propertyId: item.property_id,
      tenantId: item.tenant_id,
      tenantName: item.tenants ? item.tenants.name : 'Unknown Tenant',
      tenantEmail: item.tenants ? item.tenants.email : null,
      unitNumber: item.tenants ? item.tenants.unit_number : null,
      title: item.title,
      description: item.description,
      priority: item.priority as 'low' | 'medium' | 'high' | 'emergency',
      status: item.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
      dateSubmitted: item.date_submitted,
      dateCompleted: item.date_completed || undefined,
      assignedTo: item.assigned_to || undefined,
      cost: item.cost || undefined
    }));
  },

  async create(maintenance: Omit<Maintenance, 'id' | 'propertyName' | 'tenantName' | 'tenantEmail' | 'unitNumber' | 'dateCompleted'>) {
    const dbMaintenance = {
      property_id: maintenance.propertyId,
      tenant_id: maintenance.tenantId || null,
      title: maintenance.title,
      description: maintenance.description,
      priority: maintenance.priority,
      status: maintenance.status,
      date_submitted: maintenance.dateSubmitted || new Date().toISOString(),
      assigned_to: maintenance.assignedTo || null,
      cost: maintenance.cost || null
    };
    
    return await supabase
      .from('maintenance')
      .insert(dbMaintenance)
      .select()
      .single();
  },

  async update(id: string, updates: Partial<Maintenance>) {
    const dbMaintenance: Record<string, any> = {};
    
    if (updates.propertyId !== undefined) dbMaintenance.property_id = updates.propertyId;
    if (updates.tenantId !== undefined) dbMaintenance.tenant_id = updates.tenantId;
    if (updates.title !== undefined) dbMaintenance.title = updates.title;
    if (updates.description !== undefined) dbMaintenance.description = updates.description;
    if (updates.priority !== undefined) dbMaintenance.priority = updates.priority;
    if (updates.status !== undefined) dbMaintenance.status = updates.status;
    if (updates.dateSubmitted !== undefined) dbMaintenance.date_submitted = updates.dateSubmitted;
    if (updates.dateCompleted !== undefined) dbMaintenance.date_completed = updates.dateCompleted;
    if (updates.assignedTo !== undefined) dbMaintenance.assigned_to = updates.assignedTo;
    if (updates.cost !== undefined) dbMaintenance.cost = updates.cost;
    
    return await supabase
      .from('maintenance')
      .update(dbMaintenance)
      .eq('id', id)
      .select();
  }
};
