import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, User, Mail, Phone, Lock, Upload, MapPin, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Account = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profile?.full_name || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    
    setUpdatingProfile(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          phone: values.phone,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    setUpdatingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating password:", error.message);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    setUploadingAvatar(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl.publicUrl,
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
      
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("Error uploading avatar:", error.message);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Error signing out:", error.message);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view your account settings.</p>
      </div>
    );
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : user.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <div className="flex items-center mt-2">
            <p className="text-muted-foreground">
              Manage your account settings and profile information
            </p>
            <Badge className="ml-2 capitalize" variant={profile.user_type === "manager" ? "default" : "outline"}>
              {profile.user_type} Account
            </Badge>
          </div>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleSignOut} 
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Update your profile picture. This will be visible to other users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  {profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
                  ) : (
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  )}
                </Avatar>
                
                <div>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                    <Button variant="outline" className="gap-2" disabled={uploadingAvatar}>
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Upload new picture
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Maximum file size: 5MB. Supported formats: JPEG, PNG
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="Your full name" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              placeholder="Your email"
                              {...field}
                              disabled
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Your email cannot be changed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="Your phone number" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />
                  <h3 className="text-lg font-medium">Address Information</h3>

                  <FormField
                    control={profileForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="Street address" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Zip code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updatingProfile} className="gap-2">
                    {updatingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to improve account security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              type="password"
                              placeholder="Enter current password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              type="password"
                              placeholder="Enter new password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              type="password"
                              placeholder="Confirm new password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updatingPassword} className="gap-2">
                    {updatingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Account;
