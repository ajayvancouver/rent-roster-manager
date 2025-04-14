
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Loader2 } from "lucide-react";

const Index: React.FC = () => {
  const { user, userType, isLoading, authError } = useAuth();
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to ensure the page renders even if auth is taking too long
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);

    // Auto-redirect logged in users to their appropriate dashboard
    if (!isLoading) {
      setPageLoading(false);
      if (user && userType) {
        if (userType === "tenant") {
          navigate("/tenant/dashboard");
        } else if (userType === "manager") {
          navigate("/dashboard");
        }
      }
    }

    return () => clearTimeout(timer);
  }, [user, userType, isLoading, navigate]);

  const handleGetStarted = () => {
    navigate("/auth");
  };

  // Show a loading spinner while checking auth status (but not too long)
  if (pageLoading && isLoading && !authError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-6 bg-background border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Rent Roster</h1>
          {!user && (
            <Button onClick={() => navigate("/auth")} variant="outline">
              Sign In
            </Button>
          )}
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Property Management Made Simple
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Manage your properties, tenants, payments, and maintenance requests
              all in one place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" onClick={handleGetStarted} className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Rent Roster. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
