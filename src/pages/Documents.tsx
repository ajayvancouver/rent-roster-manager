
import { useState } from "react";
import { Search, FileText, FileUp, File, Filter, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
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
import { useDocuments } from "@/hooks/useDocuments";

const Documents = () => {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const {
    filteredDocuments,
    isLoading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    getTenantName,
    getPropertyName,
    formatDate,
    handleAddDocument
  } = useDocuments();

  const handleAddDocumentSuccess = () => {
    setShowAddModal(false);
    toast({
      title: "Success",
      description: "Document has been added successfully."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground mt-2">Manage and organize documents</p>
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
        <Select 
          value={typeFilter} 
          onValueChange={(value) => setTypeFilter(value as any)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Documents</SelectItem>
            <SelectItem value="lease">Lease Agreements</SelectItem>
            <SelectItem value="payment">Payment Records</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading documents data...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No documents found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(document => (
            <Card key={document.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{document.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Added {formatDate(document.uploadDate)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{document.type}</Badge>
                      <span className="text-xs text-muted-foreground">{document.fileSize}</span>
                    </div>
                    {document.tenantId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tenant: {getTenantName(document.tenantId)}
                      </p>
                    )}
                    {document.propertyId && (
                      <p className="text-xs text-muted-foreground">
                        Property: {getPropertyName(document.propertyId)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/documents/${document.id}`}>
                      <File className="mr-1 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={document.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-4 w-4" />
                      Open
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      <AddEntityModal
        title="Add New Document"
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSave={handleAddDocumentSuccess}
      >
        <AddDocumentForm onSuccess={handleAddDocumentSuccess} />
      </AddEntityModal>
    </div>
  );
};

export default Documents;
