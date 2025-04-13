
import { useState } from "react";
import { documents, tenants, properties } from "@/data/mockData";
import { Search, FileText, Filter, Download, Plus } from "lucide-react";
import { Document } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AddEntityModal from "@/components/common/AddEntityModal";
import AddDocumentForm from "@/components/documents/AddDocumentForm";

const DocumentsPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<Document["type"] | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);

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
      doc.type.includes(searchTerms)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDocumentTypeLabel = (type: Document["type"]) => {
    switch(type) {
      case "lease": return "Lease Agreement";
      case "payment": return "Payment Receipt";
      case "maintenance": return "Maintenance Record";
      case "other": return "Other Document";
      default: return "Document";
    }
  };

  const getDocumentTypeColor = (type: Document["type"]) => {
    switch(type) {
      case "lease": return "bg-blue-100 text-blue-800 border-blue-200";
      case "payment": return "bg-green-100 text-green-800 border-green-200";
      case "maintenance": return "bg-orange-100 text-orange-800 border-orange-200";
      case "other": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleAddDocument = () => {
    setShowAddModal(false);
    // In a real app, we would refresh the documents data from the API
    toast({
      title: "Success",
      description: "Document has been uploaded successfully."
    });
  };

  // Document type stats
  const leaseCount = documents.filter(d => d.type === "lease").length;
  const paymentCount = documents.filter(d => d.type === "payment").length;
  const maintenanceCount = documents.filter(d => d.type === "maintenance").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground mt-2">Manage and organize your property documents</p>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-4">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <h3 className="text-2xl font-bold">{documents.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground">Leases</p>
                <h4 className="text-xl font-bold">{leaseCount}</h4>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground">Payments</p>
                <h4 className="text-xl font-bold">{paymentCount}</h4>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground">Maintenance</p>
                <h4 className="text-xl font-bold">{maintenanceCount}</h4>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="pt-6 flex justify-center">
            <Button onClick={() => setShowAddModal(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
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
            onValueChange={(value) => setTypeFilter(value as Document["type"] | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="lease">Leases</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Documents Table */}
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>File Info</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {doc.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getDocumentTypeColor(doc.type)}>
                        {getDocumentTypeLabel(doc.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.propertyId ? getPropertyName(doc.propertyId) : "—"}</TableCell>
                    <TableCell>{doc.tenantId ? getTenantName(doc.tenantId) : "—"}</TableCell>
                    <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {doc.fileSize} • {doc.fileType.toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" title="Download Document">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add Document Modal */}
      <AddEntityModal
        title="Upload Document"
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={handleAddDocument}
      >
        <AddDocumentForm onSuccess={handleAddDocument} />
      </AddEntityModal>
    </div>
  );
};

export default DocumentsPage;
