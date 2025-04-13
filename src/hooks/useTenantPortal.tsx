
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { tenantsService } from "@/services/tenantsService";
import { propertiesService } from "@/services/supabaseService";
import { maintenanceService } from "@/services/maintenanceService";
import { paymentsService } from "@/services/paymentsService";
import { UserProfile } from "@/types/auth";

export function useTenantPortal() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalDue, setTotalDue] = useState(0);

  useEffect(() => {
    const loadTenantData = async () => {
      if (authLoading || !user || !profile) {
        return;
      }

      setIsLoading(true);
      try {
        // Get tenant data from profile if user_type is tenant
        if (profile.user_type === 'tenant') {
          const tenantId = await findOrCreateTenantFromProfile(profile);
          if (tenantId) {
            await Promise.all([
              loadPropertyData(profile),
              loadMaintenanceRequests(tenantId),
              loadPaymentData(tenantId),
            ]);
          } else {
            // Still allow showing profile data even without tenant record
            console.log("User has no linked tenant record, using profile data only");
            if (profile.property_id) {
              await loadPropertyDataFromProfile(profile);
            }
          }
        }
      } catch (error) {
        console.error("Error loading tenant data:", error);
        toast({
          title: "Error",
          description: "Failed to load your tenant information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTenantData();
  }, [user, profile, authLoading]);

  const findOrCreateTenantFromProfile = async (profile: UserProfile): Promise<string | null> => {
    try {
      // Check if tenant record exists for this user
      const tenant = await tenantsService.getTenantByUserId(profile.id);
      
      if (tenant) {
        console.log("Found tenant record for user:", tenant);
        return tenant.id;
      }
      
      // If we have enough information in the profile, we could create a tenant record
      // For now we'll just return null to indicate no tenant record exists
      return null;
    } catch (error) {
      console.error("Error finding tenant for user:", error);
      return null;
    }
  };

  const loadPropertyData = async (profile: UserProfile) => {
    try {
      if (profile.property_id) {
        const property = await propertiesService.getById(profile.property_id);
        
        if (property) {
          setPropertyData({
            ...property,
            unitNumber: profile.unit_number || null
          });
        }
      }
    } catch (error) {
      console.error("Error loading property data:", error);
    }
  };
  
  const loadPropertyDataFromProfile = async (profile: UserProfile) => {
    try {
      if (profile.property_id) {
        const property = await propertiesService.getById(profile.property_id);
        
        if (property) {
          setPropertyData({
            ...property,
            unitNumber: profile.unit_number || null
          });
        }
      }
    } catch (error) {
      console.error("Error loading property data from profile:", error);
    }
  };

  const loadMaintenanceRequests = async (tenantId: string) => {
    try {
      const requests = await maintenanceService.getByTenantId(tenantId);
      setMaintenanceRequests(requests);
    } catch (error) {
      console.error("Error loading maintenance requests:", error);
    }
  };

  const loadPaymentData = async (tenantId: string) => {
    try {
      const paymentData = await paymentsService.getByTenantId(tenantId);
      setPayments(paymentData);
      
      // Calculate total paid
      const paid = paymentData.reduce((sum: number, payment: any) => {
        if (payment.status === 'completed') {
          return sum + Number(payment.amount);
        }
        return sum;
      }, 0);
      
      setTotalPaid(paid);
      
      // Set total due from profile data
      if (profile?.rent_amount) {
        setTotalDue(profile.balance || 0);
      }
    } catch (error) {
      console.error("Error loading payment data:", error);
    }
  };

  return {
    isLoading: isLoading || authLoading,
    profile,
    propertyData,
    maintenanceRequests,
    payments,
    totalPaid,
    totalDue,
    // Derive values from profile when available
    leaseStart: profile?.lease_start || null,
    leaseEnd: profile?.lease_end || null,
    rentAmount: profile?.rent_amount || 0,
    depositAmount: profile?.deposit_amount || 0,
    balance: profile?.balance || 0,
  };
}
