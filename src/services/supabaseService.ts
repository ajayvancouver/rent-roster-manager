
import { paymentsService } from "./paymentsService";
import { propertiesService } from "./propertiesService";
import { tenantsService } from "./tenantsService";
import { maintenanceService } from "./maintenanceService";
import { documentsService } from "./documentsService";

// Export all services from a single file
export {
  paymentsService,
  propertiesService,
  tenantsService,
  maintenanceService,
  documentsService
};

// Create a function to initialize all data at once
export async function loadAllData() {
  try {
    const [
      properties, 
      tenants, 
      payments, 
      maintenance, 
      documents
    ] = await Promise.all([
      propertiesService.getAll(),
      tenantsService.getAll(),
      paymentsService.getAll(),
      maintenanceService.getAll(),
      documentsService.getAll()
    ]);
    
    return {
      properties,
      tenants,
      payments,
      maintenance,
      documents,
      isLoading: false,
      error: null
    };
  } catch (error) {
    console.error("Error loading data:", error);
    return {
      properties: [],
      tenants: [],
      payments: [],
      maintenance: [],
      documents: [],
      isLoading: false,
      error
    };
  }
}
