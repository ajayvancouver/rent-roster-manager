
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRound, Mail, Phone, Calendar, Building2, Wallet, LogOut } from "lucide-react";
import { format } from "date-fns";
import { useTenantPortal } from "@/hooks/useTenantPortal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TenantAccount: React.FC = () => {
  const { isLoading, profile, leaseStart, leaseEnd, rentAmount, depositAmount, propertyManager } = useTenantPortal();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
        })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <UserRound className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold">{profile?.full_name || 'Tenant'}</h2>
                <Badge className="mt-1">Tenant</Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Joined {formatDate('2023-01-01')}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" className="w-full gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact property management if needed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="profile-form" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Lease Information</CardTitle>
              <CardDescription>
                Your current lease details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Lease Start</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{formatDate(leaseStart)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Lease End</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{formatDate(leaseEnd)}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Monthly Rent</Label>
                  <div className="flex items-center mt-1">
                    <Wallet className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{formatCurrency(rentAmount)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Security Deposit</Label>
                  <div className="flex items-center mt-1">
                    <Wallet className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{formatCurrency(depositAmount)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Property</Label>
                <div className="flex items-center mt-1">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">
                    {profile?.property_id ? 'View property details in the Property tab' : 'No property assigned'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Property Manager Card */}
          <Card>
            <CardHeader>
              <CardTitle>Property Manager</CardTitle>
              <CardDescription>
                Your property manager contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {propertyManager ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <UserRound className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{propertyManager.full_name || 'Property Manager'}</h3>
                      <Badge variant="outline">Manager</Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{propertyManager.email || 'Email not available'}</span>
                    </div>
                    {propertyManager.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{propertyManager.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No property manager assigned yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TenantAccount;
