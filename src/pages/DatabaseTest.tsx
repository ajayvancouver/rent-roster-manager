
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ConnectionTestCard } from "@/components/database-test/ConnectionTestCard";
import { RLSDiagnosisCard } from "@/components/database-test/RLSDiagnosisCard";
import { SampleDataCard } from "@/components/database-test/SampleDataCard";
import { FullDatabaseTestCard } from "@/components/database-test/FullDatabaseTestCard";
import { RLSFixInfoCard } from "@/components/database-test/RLSFixInfoCard";

const DatabaseTestPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Database Connection Tests</h1>
        <p className="text-muted-foreground mt-2">
          Test and verify database connections and services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ConnectionTestCard />
        <RLSDiagnosisCard />
        <SampleDataCard />
        <FullDatabaseTestCard />
      </div>

      <RLSFixInfoCard />
      
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
