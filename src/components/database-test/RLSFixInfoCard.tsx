
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export const RLSFixInfoCard = () => {
  const { toast } = useToast();
  const [isFixed, setIsFixed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRLSFunctions = async () => {
      try {
        setIsLoading(true);
        
        // Check for the get_user_managed_properties function
        const { data, error } = await supabase.rpc('get_user_managed_properties');
        
        if (error && error.message.includes('function') && error.message.includes('does not exist')) {
          // Function doesn't exist
          console.log("RLS security definer functions don't exist:", error);
          setIsFixed(false);
        } else {
          // Verify that RLS policies don't have recursion issues
          try {
            // Test a simple query to verify no recursion happens
            const { error: queryError } = await supabase
              .from('properties')
              .select('id')
              .limit(1);
              
            if (queryError && queryError.message.includes('recursion')) {
              console.log("RLS policies still have recursion issues:", queryError);
              setIsFixed(false);
            } else {
              console.log("RLS security definer functions exist and work properly");
              setIsFixed(true);
            }
          } catch (queryErr) {
            console.error("Error testing RLS policies:", queryErr);
            setIsFixed(false);
          }
        }
      } catch (error) {
        console.error("Error checking RLS functions:", error);
        setIsFixed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRLSFunctions();
  }, []);

  const handleFixClick = async () => {
    try {
      window.open("https://supabase.com/dashboard/project/noxdsmplywvhcdbqkxds/sql/new", "_blank");
    } catch (error) {
      console.error("Error opening SQL editor:", error);
      toast({
        title: "Error",
        description: "Could not open SQL editor. Please navigate to your Supabase project manually.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isFixed ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              RLS Policies Fixed
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Fix RLS Recursive Policy
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isFixed 
            ? "Security definer functions have been implemented to prevent recursive RLS issues" 
            : "Information about fixing recursive RLS policies in Supabase"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isFixed ? (
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="font-medium text-green-900">RLS Policy Fix Successfully Applied</h3>
            <p className="text-sm text-green-800 mt-2">
              Your database is now using security definer functions to prevent infinite recursion in RLS policies.
              This has resolved the "infinite recursion detected in policy" errors you were experiencing.
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 p-4 rounded-md">
            <h3 className="font-medium text-amber-900">How to Fix Recursive RLS Policy Issues:</h3>
            <p className="text-sm text-amber-800 mt-2">
              The error "infinite recursion detected in policy for relation 'properties'" occurs when an RLS policy references the same table it's applied to.
            </p>
            
            <div className="mt-3">
              <h4 className="font-medium text-amber-900">Solution:</h4>
              <ol className="list-decimal pl-5 text-sm space-y-2 mt-1 text-amber-800">
                <li>
                  Create security definer functions in your database that return the required data
                  <pre className="bg-amber-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                    {`CREATE OR REPLACE FUNCTION public.get_user_managed_properties()
RETURNS SETOF uuid AS $$
  SELECT id FROM properties WHERE manager_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;`}
                  </pre>
                </li>
                <li>
                  Use these functions in your RLS policies instead of directly querying the table
                  <pre className="bg-amber-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                    {`CREATE POLICY "managers can view tenants of their properties" 
ON tenants FOR SELECT 
USING (property_id IN (SELECT * FROM get_user_managed_properties()));`}
                  </pre>
                </li>
              </ol>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2" 
                onClick={handleFixClick}
              >
                <ExternalLink className="h-4 w-4" />
                Open SQL Editor
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
