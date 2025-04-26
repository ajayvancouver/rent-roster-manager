
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const RLSFixInfoCard = () => {
  const { toast } = useToast();
  const [isFixed, setIsFixed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRLSFunctions = async () => {
      try {
        setIsLoading(true);
        // Check if the security definer functions exist
        const { data: functions, error } = await supabase
          .from('pg_catalog.pg_proc')
          .select('proname')
          .eq('proname', 'is_property_manager')
          .limit(1);
        
        if (error) {
          console.error("Error checking RLS functions:", error);
          setIsFixed(false);
          return;
        }
        
        setIsFixed(functions && functions.length > 0);
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
              <AlertTriangle className="h-5 w-5" />
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
              This should resolve any "infinite recursion detected in policy" errors you were experiencing.
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
                  Create a security definer function in your database that returns the required data
                  <pre className="bg-amber-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                    {`CREATE OR REPLACE FUNCTION public.is_property_manager(property_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM properties 
    WHERE id = property_id AND manager_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;`}
                  </pre>
                </li>
                <li>
                  Use this function in your RLS policy instead of directly querying the table
                  <pre className="bg-amber-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                    {`CREATE POLICY "Users can view properties they manage" 
ON properties FOR SELECT 
USING (manager_id = auth.uid() OR public.is_property_manager(id));`}
                  </pre>
                </li>
              </ol>
            </div>
            
            <p className="text-sm text-amber-800 mt-3">
              You need to run these SQL commands in your Supabase SQL editor to fix the RLS policies.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
