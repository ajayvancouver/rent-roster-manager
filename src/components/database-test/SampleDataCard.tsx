
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Users } from "lucide-react";
import { createAndTestSampleData } from "@/utils/dbConnectionTest";
import { useToast } from "@/hooks/use-toast";

export const SampleDataCard = () => {
  const { toast } = useToast();
  const [isSampleDataTesting, setIsSampleDataTesting] = useState(false);
  const [sampleDataResult, setSampleDataResult] = useState<{
    success: boolean;
    message: string;
    managerCredentials?: { email: string; password: string };
    tenantCredentials?: { email: string; password: string };
  } | null>(null);

  const handleCreateSampleData = async () => {
    setIsSampleDataTesting(true);
    try {
      const result = await createAndTestSampleData();
      setSampleDataResult(result);
      
      toast({
        title: result.success ? "Sample Data Created" : "Sample Data Creation Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error creating sample data:", error);
      setSampleDataResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
      
      toast({
        title: "Sample Data Creation Failed",
        description: "An unexpected error occurred while creating sample data",
        variant: "destructive"
      });
    } finally {
      setIsSampleDataTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Create Sample Data
        </CardTitle>
        <CardDescription>
          Generate sample accounts, properties and tenants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleCreateSampleData} 
          disabled={isSampleDataTesting}
          className="w-full"
        >
          {isSampleDataTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Sample Data"
          )}
        </Button>
        
        {sampleDataResult && (
          <div className="p-3 rounded border">
            <div className="flex items-center gap-2 mb-2">
              {sampleDataResult.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="outline" className="bg-green-50">Success</Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <Badge variant="outline" className="bg-red-50">Failed</Badge>
                </>
              )}
            </div>
            <p className="text-sm">{sampleDataResult.message}</p>
            
            {sampleDataResult.success && (
              <div className="mt-3 space-y-3">
                <div className="bg-blue-50 p-2 rounded text-xs">
                  <p className="font-medium">Manager Account:</p>
                  <p>Email: {sampleDataResult.managerCredentials?.email}</p>
                  <p>Password: {sampleDataResult.managerCredentials?.password}</p>
                </div>
                <div className="bg-purple-50 p-2 rounded text-xs">
                  <p className="font-medium">Tenant Account:</p>
                  <p>Email: {sampleDataResult.tenantCredentials?.email}</p>
                  <p>Password: {sampleDataResult.tenantCredentials?.password}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
