
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Database, Users, Home, Wrench, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { testSupabaseConnection, createAndTestSampleData, runFullDatabaseTest, diagnoseRLSIssues } from "@/utils/dbConnectionTest";

const DatabaseTestPage = () => {
  const { toast } = useToast();
  
  const [isConnectionTesting, setIsConnectionTesting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [isRLSDiagnosing, setIsRLSDiagnosing] = useState(false);
  const [rlsResults, setRlsResults] = useState<{ 
    success: boolean; 
    message: string; 
    issues: string[] 
  } | null>(null);
  
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
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
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

      {/* RLS Issue Alert - Shows if issues detected */}
      {rlsResults && !rlsResults.success && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>RLS Policy Issues Detected</AlertTitle>
          <AlertDescription>
            <p>Your Supabase project has RLS (Row Level Security) policy issues that need to be fixed:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {rlsResults.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
            <p className="mt-2">This typically happens when an RLS policy references the same table it's applied to.</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        {/* RLS Diagnosis Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
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
                      <Badge variant="outline" className="bg-red-50">Issues Found</Badge>
                    </>
                  )}
                </div>
                <p className="text-sm">{rlsResults.message}</p>
                
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
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Fix RLS Recursive Policy
          </CardTitle>
          <CardDescription>
            Information about fixing recursive RLS policies in Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <div className="mt-4">
            <h3 className="font-medium">If data still doesn't appear after fixing RLS:</h3>
            <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
              <li>Verify that your user has the correct permissions in the database</li>
              <li>Ensure all tables have appropriate RLS policies enabled</li>
              <li>Check that properties have the correct manager_id assigned to them</li>
              <li>Try creating new sample data and testing with those credentials</li>
              <li>Make sure your user is properly authenticated before fetching data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4" />
          Reload Page
        </Button>
      </div>
    </div>
  );
};

export default DatabaseTestPage;
