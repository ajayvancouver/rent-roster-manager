
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import { createSampleManager, createSampleTenant, logoutCurrentUser } from "@/services/sampleAccounts";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const { user, signIn, signUp, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"manager" | "tenant">("tenant");
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState<string | null>(null);
  
  // Sample account states
  const [creatingTenant, setCreatingTenant] = useState(false);
  const [creatingManager, setCreatingManager] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sampleTenant, setSampleTenant] = useState<{ email: string; password: string } | null>(null);
  const [sampleManager, setSampleManager] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    // Auto-logout current user when page loads
    const performAutoLogout = async () => {
      try {
        setLoggingOut(true);
        await logoutCurrentUser();
      } catch (error) {
        console.error("Auto-logout failed:", error);
      } finally {
        setLoggingOut(false);
      }
    };
    
    performAutoLogout();
  }, []);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim() || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    try {
      await signIn(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(
        error.message?.includes("Invalid login credentials") 
          ? "Incorrect email or password. Please try again." 
          : error.message || "An unexpected error occurred. Please try again later."
      );
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!fullName.trim()) {
      setError("Please provide your full name");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      await signUp(email, password, userType, fullName);
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });
      setActiveTab("login");
    } catch (error: any) {
      console.error("Sign up error:", error);
      setError(
        error.message?.includes("User already registered")
          ? "An account with this email already exists. Please sign in." 
          : error.message || "Registration failed. Please try again."
      );
    }
  };

  const clearError = () => {
    setError(null);
  };

  const handleCreateSampleTenant = async () => {
    try {
      setCreatingTenant(true);
      const credentials = await createSampleTenant();
      setSampleTenant(credentials);
      toast({
        title: "Sample Tenant Created",
        description: "A sample tenant account has been created for testing."
      });
    } catch (error: any) {
      toast({
        title: "Error Creating Sample Tenant",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setCreatingTenant(false);
    }
  };

  const handleCreateSampleManager = async () => {
    try {
      setCreatingManager(true);
      const credentials = await createSampleManager();
      setSampleManager(credentials);
      toast({
        title: "Sample Manager Created",
        description: "A sample property manager account has been created for testing."
      });
    } catch (error: any) {
      toast({
        title: "Error Creating Sample Manager",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setCreatingManager(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutCurrentUser();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error Logging Out",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Account Access" />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 p-6 bg-white rounded-lg shadow-md">
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Property Manager</CardTitle>
              <CardDescription>
                Sign in to manage your properties or access your tenant portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => { setActiveTab(value); clearError(); }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="userType">I am a</Label>
                      <Select
                        value={userType}
                        onValueChange={(value) => setUserType(value as "manager" | "tenant")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tenant">Tenant</SelectItem>
                          <SelectItem value="manager">Property Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              {/* Sample Account Generator Section */}
              <div className="mt-8">
                <Separator className="my-4" />
                <h3 className="text-lg font-medium mb-4">Test Account Generator</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={handleCreateSampleTenant}
                      disabled={creatingTenant}
                    >
                      {creatingTenant ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : "Create Tenant Account"}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={handleCreateSampleManager}
                      disabled={creatingManager}
                    >
                      {creatingManager ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : "Create Manager Account"}
                    </Button>
                  </div>
                  
                  <Button 
                    variant="secondary"
                    className="w-full"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    {loggingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging out...
                      </>
                    ) : "Log Out Current User"}
                  </Button>
                </div>
                
                {/* Display generated credentials */}
                {(sampleTenant || sampleManager) && (
                  <div className="mt-4 p-4 border rounded-md bg-muted">
                    <h4 className="font-medium mb-2">Sample Credentials</h4>
                    
                    {sampleTenant && (
                      <div className="mb-2">
                        <p className="font-medium text-sm">Tenant Account:</p>
                        <p className="text-sm">Email: {sampleTenant.email}</p>
                        <p className="text-sm">Password: {sampleTenant.password}</p>
                      </div>
                    )}
                    
                    {sampleManager && (
                      <div>
                        <p className="font-medium text-sm">Manager Account:</p>
                        <p className="text-sm">Email: {sampleManager.email}</p>
                        <p className="text-sm">Password: {sampleManager.password}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
