
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Database } from "lucide-react";
import { testSupabaseConnection } from "@/utils/dbConnectionTest";
import { useToast } from "@/hooks/use-toast";

export const ConnectionTestCard = () => {
  const { toast } = useToast();
  const [isConnectionTesting, setIsConnectionTesting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);

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

  return (
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
  );
};
