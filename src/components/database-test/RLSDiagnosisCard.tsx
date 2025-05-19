
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { diagnoseRLSIssues } from "@/utils/dbConnectionTest";
import { useToast } from "@/hooks/use-toast";

export const RLSDiagnosisCard = () => {
  const { toast } = useToast();
  const [isRLSDiagnosing, setIsRLSDiagnosing] = useState(false);
  const [rlsResults, setRlsResults] = useState<{ 
    success: boolean; 
    message: string; 
    issues: string[];
    functionStatus?: {
      exists: boolean;
      name: string;
      hasSearchPath?: boolean;
    }[];
  } | null>(null);

  const handleDiagnoseRLS = async () => {
    setIsRLSDiagnosing(true);
    try {
      const result = await diagnoseRLSIssues();
      
      setRlsResults(result);
      
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

  // Format error message for display
  const formatErrorMessage = (message: string) => {
    if (!message) return "No error message available";
    if (typeof message !== 'string') return "Error occurred - check console for details";
    if (message.includes('[object Object]')) return "Error occurred - check console for details";
    
    // Try to parse JSON string if it looks like one
    if (message.startsWith('{') && message.endsWith('}')) {
      try {
        const parsed = JSON.parse(message);
        if (parsed.message) {
          return parsed.message;
        } else if (parsed.error) {
          return parsed.error;
        }
      } catch (e) {
        // Not valid JSON, just continue
      }
    }
    
    // Extract message from error objects like {"code":"42P17","details":null,"hint":null,"message":"infinite recursion detected in policy for relation \"properties\""}
    try {
      const errorObj = JSON.parse(message);
      if (errorObj.message) {
        return errorObj.message;
      }
    } catch (e) {
      // Not valid JSON, just continue
    }
    
    return message;
  };

  const getTotalPassedTests = () => {
    if (!rlsResults) return 0;
    return Object.values(rlsResults.functionStatus || []).filter(result => result.exists && result.hasSearchPath).length;
  };
  
  const getTotalTests = () => {
    if (!rlsResults) return 0;
    return Object.keys(rlsResults.functionStatus || {}).length;
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
    
    const hasSearchPathIssues = rlsResults.functionStatus?.some(
      func => func.exists && !func.hasSearchPath
    );
    
    if (hasFunctionIssues && hasRecursionIssues && hasSearchPathIssues) {
      return "Multiple Issues";
    } else if (hasFunctionIssues && hasRecursionIssues) {
      return "Function & Recursion Issues";
    } else if (hasFunctionIssues && hasSearchPathIssues) {
      return "Function & Search Path Issues";
    } else if (hasRecursionIssues && hasSearchPathIssues) {
      return "Recursion & Search Path Issues";
    } else if (hasFunctionIssues) {
      return "Missing Functions";
    } else if (hasRecursionIssues) {
      return "Recursion Issues";
    } else if (hasSearchPathIssues) {
      return "Search Path Issues";
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
                      {func.exists && func.hasSearchPath ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : func.exists ? (
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>
                        {func.name}: {func.exists ? (func.hasSearchPath ? 'OK' : 'Missing search_path') : 'Missing'}
                      </span>
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
