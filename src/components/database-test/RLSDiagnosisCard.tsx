
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { diagnoseRLSIssues } from "@/utils/dbConnectionTest";
import { useToast } from "@/hooks/use-toast";

// Define allowed function names as a type
type SecurityDefinerFunction = 
  | "get_user_managed_properties" 
  | "is_property_manager" 
  | "is_tenant_of_managed_property"
  | "get_manager_properties"
  | "is_tenant_of_user_managed_property"
  | "is_user_property_manager";

export const RLSDiagnosisCard = () => {
  const { toast } = useToast();
  const [isRLSDiagnosing, setIsRLSDiagnosing] = useState(false);
  const [rlsResults, setRlsResults] = useState<{ 
    success: boolean; 
    message: string; 
    issues: string[];
    functionStatus?: {
      exists: boolean;
      name: SecurityDefinerFunction;
    }[];
  } | null>(null);

  const handleDiagnoseRLS = async () => {
    setIsRLSDiagnosing(true);
    try {
      const result = await diagnoseRLSIssues();
      
      // Type assertion to ensure the functionStatus field has the correct type
      const typedResult = {
        ...result,
        functionStatus: result.functionStatus?.map(func => ({
          exists: func.exists,
          name: func.name as SecurityDefinerFunction
        }))
      };
      
      setRlsResults(typedResult);
      
      toast({
        title: result.success ? "RLS Policies OK" : "RLS Policy Issues",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error diagnosing RLS:", error);
      setRlsResults({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        issues: ["Unknown error during diagnosis"]
      });
      
      toast({
        title: "RLS Diagnosis Failed",
        description: "An unexpected error occurred while checking RLS policies",
        variant: "destructive"
      });
    } finally {
      setIsRLSDiagnosing(false);
    }
  };

  const getBadgeText = () => {
    if (!rlsResults) return "";
    
    if (rlsResults.success) {
      return "No Issues";
    }
    
    const hasFunctionIssues = rlsResults.issues.some(
      issue => issue.includes("function") || issue.includes("security definer")
    );
    
    const hasRecursionIssues = rlsResults.issues.some(
      issue => issue.includes("recursion")
    );
    
    if (hasFunctionIssues && hasRecursionIssues) {
      return "Function & Recursion Issues";
    } else if (hasFunctionIssues) {
      return "Missing Functions";
    } else if (hasRecursionIssues) {
      return "Recursion Issues";
    }
    
    return "Issues Found";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          RLS Policy Check
        </CardTitle>
        <CardDescription>
          Diagnose Row Level Security policy issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleDiagnoseRLS} 
          disabled={isRLSDiagnosing}
          variant="outline"
          className="w-full"
        >
          {isRLSDiagnosing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Check RLS Policies"
          )}
        </Button>
        
        {rlsResults && (
          <div className="p-3 rounded border">
            <div className="flex items-center gap-2 mb-2">
              {rlsResults.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="outline" className="bg-green-50">No Issues</Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <Badge variant="outline" className="bg-red-50">{getBadgeText()}</Badge>
                </>
              )}
            </div>
            <p className="text-sm">{rlsResults.message}</p>
            
            {rlsResults.functionStatus && rlsResults.functionStatus.length > 0 && (
              <div className="mt-2 border-t pt-2">
                <p className="text-xs font-medium mb-1">Security Definer Functions:</p>
                <ul className="text-xs space-y-1">
                  {rlsResults.functionStatus.map((func, i) => (
                    <li key={i} className="flex items-center gap-1">
                      {func.exists ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>{func.name}: {func.exists ? 'OK' : 'Missing'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {!rlsResults.success && rlsResults.issues.length > 0 && (
              <div className="mt-2 text-xs text-red-500">
                <ul className="list-disc pl-4">
                  {rlsResults.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
