
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Database, Gauge, RefreshCw } from "lucide-react";
import { runFullDatabaseTest } from "@/utils/dbConnectionTest";
import { useToast } from "@/hooks/use-toast";

export const FullDatabaseTestCard = () => {
  const { toast } = useToast();
  const [isFullTesting, setIsFullTesting] = useState(false);
  const [fullTestResult, setFullTestResult] = useState<{
    success: boolean;
    message: string;
    details: Record<string, { success: boolean; message: string }>;
  } | null>(null);

  const handleFullTest = async () => {
    setIsFullTesting(true);
    try {
      const result = await runFullDatabaseTest();
      setFullTestResult(result);
      
      toast({
        title: result.success ? "Database Tests Passed" : "Database Tests Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error running full database test:", error);
      setFullTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        details: {}
      });
      
      toast({
        title: "Test Failed",
        description: "An unexpected error occurred while testing the database",
        variant: "destructive"
      });
    } finally {
      setIsFullTesting(false);
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
    if (!fullTestResult) return 0;
    return Object.values(fullTestResult.details).filter(result => result.success).length;
  };
  
  const getTotalTests = () => {
    if (!fullTestResult) return 0;
    return Object.keys(fullTestResult.details).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Full Database Test
        </CardTitle>
        <CardDescription>
          Test all database services and connections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleFullTest} 
          disabled={isFullTesting}
          className="w-full"
          variant="default"
        >
          {isFullTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing All Services...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Full Database Test
            </>
          )}
        </Button>
        
        {fullTestResult && (
          <div className="p-3 rounded border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {fullTestResult.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Badge variant="outline" className="bg-green-50">All Tests Passed</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <Badge variant="outline" className="bg-red-50">Test Failures</Badge>
                  </>
                )}
              </div>
              <Badge variant={fullTestResult.success ? "success" : "destructive"} className="ml-auto">
                {getTotalPassedTests()}/{getTotalTests()} Tests Passed
              </Badge>
            </div>
            <p className="text-sm">{fullTestResult.message}</p>
            
            {Object.keys(fullTestResult.details).length > 0 && (
              <div className="mt-3 space-y-2">
                {Object.entries(fullTestResult.details).map(([key, value]) => (
                  <div key={key} className={`p-2 rounded text-xs ${value.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2">
                      {value.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="font-medium">{key}</span>
                    </div>
                    <p className="mt-1 pl-6 break-words">{formatErrorMessage(value.message)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
