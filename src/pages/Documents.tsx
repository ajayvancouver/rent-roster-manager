
import { useState } from "react";
import { Search, FilePlus, File, FileText, FileSpreadsheet, Filter } from "lucide-react";
import { documents, tenants, properties } from "@/data/mockData";
import { Document as DocType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocType["type"] | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get tenant and property info
  const getTenantName = (tenantId?: string) => {
    if (!tenantId) return "N/A";
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : "Unknown";
  };

  const getPropertyName = (propertyId?: string) => {
    if (!propertyId) return "N/A";
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : "Unknown";
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    // Apply type filter
    if (typeFilter !== "all" && doc.type !== typeFilter) {
      return false;
    }
    
    // Apply search filter
    const searchTerms = searchQuery.toLowerCase();
    const tenantName = doc.tenantId ? getTenantName(doc.tenantId).toLowerCase() : "";
    const propertyName = doc.propertyId ? getPropertyName(doc.propertyId).toLowerCase() : "";
    
    return (
      doc.name.toLowerCase().includes(searchTerms) ||
      tenantName.includes(searchTerms) ||
      propertyName.includes(searchTerms) ||
      doc.type.toLowerCase().includes(searchTerms)
    );
  });

  // Total document stats
  const leaseDocsCount = documents.filter(d => d.type === "lease").length;
  const paymentDocsCount = documents.filter(d => d.type === "payment").length;
  const maintenanceDocsCount = documents.filter(d => d.type === "maintenance").length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDocumentIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type === "pdf") {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (type.includes("excel") || type.includes("spreadsheet") || type === "xlsx") {
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    } else {
      return <File className="h-6 w-6 text-blue-500" />;
    }
  };

  const getTypeColor = (type: DocType["type"]) => {
    switch (type) {
      case "lease": return "bg-blue-100 text-blue-800 border-blue-200";
      case "payment": return "bg-green-100 text-green-800 border-green-200";
      case "maintenance": return "bg-orange-100 text-orange-800 border-orange-200";
      case "other": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground mt-2">Organize and access property documents</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
                <File className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">All Documents</p>
                <h3 className="text-2xl font-bold">{documents.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leases</p>
                <h3 className="text-2xl font-bold">{leaseDocsCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-4">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payments</p>
                <h3 className="text-2xl font-bold">{paymentDocsCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-orange-100 text-orange-600 mr-4">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                <h3 className="text-2xl font-bold">{maintenanceDocsCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as DocType["type"] | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="lease">Lease</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              className="rounded-none"
              onClick={() => setViewMode("grid")}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              className="rounded-none"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
          </div>
          <Button>
            <FilePlus className="h-4 w-4 mr-1" />
            Upload
          </Button>
        </div>
      </div>

      {/* Documents Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredDocuments.map(doc => (
            <Card key={doc.id} className="card-hover">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-secondary/50 rounded-md mb-4">
                    {getDocumentIcon(doc.fileType)}
                  </div>
                  <h3 className="font-medium text-sm line-clamp-2 mb-2">{doc.name}</h3>
                  <Badge variant="outline" className={getTypeColor(doc.type)}>
                    {doc.type}
                  </Badge>
                  <div className="w-full mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
                    <span>{doc.fileSize}</span>
                    <span>{formatDate(doc.uploadDate)}</span>
                  </div>
                  <div className="w-full mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      View Document
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map(doc => (
            <Card key={doc.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="mr-4">
                    {getDocumentIcon(doc.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{doc.name}</h3>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Uploaded: {formatDate(doc.uploadDate)}</span>
                      <span>Size: {doc.fileSize}</span>
                      {doc.tenantId && <span>Tenant: {getTenantName(doc.tenantId)}</span>}
                      {doc.propertyId && <span>Property: {getPropertyName(doc.propertyId)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getTypeColor(doc.type)}>
                      {doc.type}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;
