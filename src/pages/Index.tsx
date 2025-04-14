
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index: React.FC = () => {
  const { user, userType, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect logged in users to their appropriate dashboard
    if (!isLoading && user) {
      if (userType === "tenant") {
        navigate("/tenant/dashboard");
      } else if (userType === "manager") {
        navigate("/dashboard");
      }
    }
  }, [user, userType, isLoading, navigate]);

  const handleGetStarted = () => {
    navigate("/auth");
  };

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
