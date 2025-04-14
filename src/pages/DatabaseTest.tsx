
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Database, Users, Home, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { testSupabaseConnection, createAndTestSampleData, runFullDatabaseTest } from "@/utils/dbConnectionTest";

const DatabaseTestPage = () => {
  const { toast } = useToast();
  const [isConnectionTesting, setIsConnectionTesting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [isSampleDataTesting, setIsSampleDataTesting] = useState(false);
  const [sampleDataResult, setSampleDataResult] = useState<{
    success: boolean;
    message: string;
    managerCredentials?: { email: string; password: string };
    tenantCredentials?: { email: string; password: string };
  } | null>(null);
  
  const [isFullTesting, setIsFullTesting] = useState(false);
  const [fullTestResult, setFullTestResult] = useState<{
    success: boolean;
    message: string;
    details: Record<string, { success: boolean; message: string }>;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsConnectionTesting(true);
    try {
      const result = await testSupabaseConnection();
      setConnectionResult(result);
      
      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error testing connection:", error);
      setConnectionResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
      
      toast({
        title: "Test Failed",
        description: "An unexpected error occurred while testing the connection",
        variant: "destructive"
      });
    } finally {
      setIsConnectionTesting(false);
    }
  };

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Database Connection Tests</h1>
        <p className="text-muted-foreground mt-2">
          Test and verify database connections and services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connection Test Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Connection Test
            </CardTitle>
            <CardDescription>
              Test the basic connection to the Supabase database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleTestConnection} 
              disabled={isConnectionTesting}
              className="w-full"
            >
              {isConnectionTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            
            {connectionResult && (
              <div className="p-3 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  {connectionResult.success ? (
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
                <p className="text-sm">{connectionResult.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sample Data Creation Card */}
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

        {/* Full Database Test Card */}
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">If newly added properties don't show up:</h3>
            <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
              <li>Check if your database connection is working (Run the tests above)</li>
              <li>Ensure the current user has a valid profile with manager permissions</li>
              <li>Try manually refreshing the data by clicking the Refresh button</li>
              <li>Check the console for any API errors</li>
              <li>Verify that properties are being saved with the correct manager ID</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium">If tenant data isn't loading:</h3>
            <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
              <li>Ensure the tenant is correctly linked to a user profile</li>
              <li>Check that the property assignment is correct in the database</li>
              <li>Verify the tenant has an active status and valid lease dates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseTestPage;
