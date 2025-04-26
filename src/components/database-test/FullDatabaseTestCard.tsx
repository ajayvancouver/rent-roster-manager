
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Wrench } from "lucide-react";
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

  const handleRunFullTest = async () => {
    setIsFullTesting(true);
    try {
      const result = await runFullDatabaseTest();
      setFullTestResult(result);
      
      toast({
        title: result.success ? "All Tests Passed" : "Some Tests Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error running full test:", error);
      setFullTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        details: {}
      });
      
      toast({
        title: "Test Failed",
        description: "An unexpected error occurred while running the database tests",
        variant: "destructive"
      });
    } finally {
      setIsFullTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Run Full Database Test
        </CardTitle>
        <CardDescription>
          Test all database services and connections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleRunFullTest} 
          disabled={isFullTesting}
          className="w-full"
        >
          {isFullTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Run Full Test"
          )}
        </Button>
        
        {fullTestResult && (
          <div className="p-3 rounded border">
            <div className="flex items-center gap-2 mb-2">
              {fullTestResult.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="outline" className="bg-green-50">All Tests Passed</Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <Badge variant="outline" className="bg-red-50">Some Tests Failed</Badge>
                </>
              )}
            </div>
            <p className="text-sm">{fullTestResult.message}</p>
            
            {fullTestResult.details && Object.entries(fullTestResult.details).length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium">Details:</p>
                {Object.entries(fullTestResult.details).map(([service, result]) => (
                  <div key={service} className={`p-2 rounded text-xs ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-1">
                      {result.success ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <p className="font-medium capitalize">{service}:</p>
                    </div>
                    <p className="ml-4">{result.message}</p>
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
