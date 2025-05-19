import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { SecurityDefinerFunction, requiredSecurityFunctions } from "@/utils/database/rlsTest";

export const RLSFixInfoCard = () => {
  const { toast } = useToast();
  const [isFixed, setIsFixed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [functionInfo, setFunctionInfo] = useState<{
    name: SecurityDefinerFunction;
    exists: boolean;
    hasSearchPath?: boolean;
  }[]>([]);

  useEffect(() => {
    const checkRLSFunctions = async () => {
      try {
        setIsLoading(true);
        
        // List of security definer functions we expect to find (exclude admin_query)
        const requiredFunctions = requiredSecurityFunctions;
        
        // Query to check if search_path is set for each function
        const searchPathQuery = `
          SELECT 
            routine_name, 
            (SELECT option_value
             FROM pg_options_to_table(proconfig)
             WHERE option_name = 'search_path') as search_path
          FROM information_schema.routines
          WHERE routine_schema = 'public'
          AND routine_type = 'FUNCTION'
          AND routine_name = any($1::text[])
        `;
        
        // Get search_path information for functions using admin_query
        const { data: searchPathData, error: searchPathError } = await supabase.rpc(
          "admin_query", // Now this is a valid SecurityDefinerFunction
          { sql_query: searchPathQuery, params: [requiredFunctions] }
        );
        
        const searchPathMap = new Map();
        if (searchPathData && !searchPathError) {
          // Use type guard to check if searchPathData is an array before using forEach
          if (Array.isArray(searchPathData)) {
            searchPathData.forEach((row: any) => {
              searchPathMap.set(row.routine_name, !!row.search_path);
            });
          }
        }
        
        const results = await Promise.all(
          requiredFunctions.map(async (funcName) => {
            // Check if the function exists
            try {
              const { error } = await supabase.rpc(funcName);
              
              // Even if we get an error with parameters, the function exists
              // We're just checking if it's a "function doesn't exist" error or not
              const exists = !(error && error.message.includes('function') && error.message.includes('does not exist'));
              
              return {
                name: funcName,
                exists,
                hasSearchPath: exists ? searchPathMap.get(funcName) || false : false
              };
            } catch (err) {
              console.error(`Error checking ${funcName}:`, err);
              return {
                name: funcName,
                exists: false,
                hasSearchPath: false
              };
            }
          })
        );
        
        setFunctionInfo(results);
        
        // If all functions exist and have search_path, we consider it fixed
        const allFunctionsExist = results.every(fn => fn.exists);
        const allHaveSearchPath = results.every(fn => fn.exists && fn.hasSearchPath);
        
        if (allFunctionsExist && allHaveSearchPath) {
          // Verify RLS policies don't have recursion issues
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
              console.log("RLS security definer functions exist, have search_path set, and work properly");
              setIsFixed(true);
            }
          } catch (queryErr) {
            console.error("Error testing RLS policies:", queryErr);
            setIsFixed(false);
          }
        } else {
          setIsFixed(false);
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

  const handleFixClick = () => {
    window.open("https://supabase.com/dashboard/project/noxdsmplywvhcdbqkxds/sql/new", "_blank");
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
              {isLoading ? "Checking RLS Status..." : "RLS Policy Fix Required"}
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
        {isLoading ? (
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-800">Checking RLS policy status...</p>
          </div>
        ) : isFixed ? (
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="font-medium text-green-900">RLS Policy Fix Successfully Applied</h3>
            <p className="text-sm text-green-800 mt-2">
              Your database is now using security definer functions with explicit search_path settings to prevent infinite recursion in RLS policies.
              This has resolved the "infinite recursion detected in policy" errors you were experiencing.
            </p>
            
            <div className="mt-3">
              <p className="text-sm font-medium text-green-900">Applied Security Definer Functions:</p>
              <ul className="list-disc pl-5 text-sm mt-1 text-green-800">
                {functionInfo.map((fn, i) => (
                  <li key={i}>{fn.name} {fn.hasSearchPath ? '(with search_path)' : ''}</li>
                ))}
              </ul>
            </div>
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
                  Create security definer functions in your database that return the required data with explicit search_path
                  <pre className="bg-amber-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                    {`CREATE OR REPLACE FUNCTION public.get_user_managed_properties()
RETURNS SETOF uuid AS $$
  SELECT id FROM properties WHERE manager_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;`}
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
              <p className="text-sm font-medium text-amber-900">Function Status:</p>
              <ul className="list-disc pl-5 text-sm mt-1 text-amber-800">
                {functionInfo
                  .filter(fn => !fn.exists || !fn.hasSearchPath)
                  .map((fn, i) => (
                    <li key={i}>
                      {fn.name}: {!fn.exists ? 'Missing' : !fn.hasSearchPath ? 'Missing search_path' : 'OK'}
                    </li>
                  ))}
              </ul>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 mt-3" 
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
