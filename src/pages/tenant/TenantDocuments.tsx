
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, FilePlus, Download, FileImage, FileArchive, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useTenantPortal } from "@/hooks/useTenantPortal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { documentsService } from "@/services/documents";

const TenantDocuments: React.FC = () => {
  const { isLoading, documents, propertyData, tenantData, profile } = useTenantPortal();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('other');
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getDocumentTypeIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('zip') || fileType.includes('rar')) {
      return <FileArchive className="h-5 w-5 text-amber-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'lease':
        return { label: 'Lease', color: 'bg-purple-100 text-purple-800' };
      case 'payment':
        return { label: 'Payment', color: 'bg-green-100 text-green-800' };
      case 'maintenance':
        return { label: 'Maintenance', color: 'bg-orange-100 text-orange-800' };
      case 'other':
      default:
        return { label: 'Other', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenantData?.id) {
      toast({
        title: "Error",
        description: "Missing tenant information. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    if (!file || !docName) {
      toast({
        title: "Error",
        description: "Please select a file and provide a name",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create document object
      const documentData = {
        name: docName,
        type: docType,
        tenantId: tenantData.id,
        propertyId: tenantData.propertyId || "",
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        fileType: file.type,
        url: "" // Will be updated after file upload
      };
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${tenantData.id}_${Date.now()}.${fileExt}`;
      const filePath = `tenant_documents/${fileName}`;
      
      // Check if storage bucket exists, if not it will use the default public bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw new Error("Failed to upload file. Please try again.");
      }
      
      // Get public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      // Update the document data with the file URL
      documentData.url = publicUrl;
      
      // Create document record using the service
      const result = await documentsService.create(documentData);
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      
      setFile(null);
      setDocName('');
      setDocType('other');
      setDialogOpen(false);
      
      // Refresh the page to show the new document
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-2">View and download your documents</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <FilePlus className="h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload a Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="docName">Document Name</Label>
                <Input 
                  id="docName" 
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g., Lease Agreement"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="docType">Document Type</Label>
                <Select
                  value={docType}
                  onValueChange={setDocType}
                >
                  <SelectTrigger id="docType">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lease">Lease</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input 
                  id="file" 
                  type="file"
                  onChange={handleFileChange}
                  required
                />
                {file && (
                  <p className="text-xs text-muted-foreground mt-1">
                    File size: {(file.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">No Documents Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You don't have any documents yet. Upload your first document using the button above.
            </p>
            <Button onClick={() => setDialogOpen(true)}>Upload Document</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => {
            const typeInfo = getDocumentTypeText(doc.type);
            return (
              <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{doc.name}</CardTitle>
                    <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Uploaded on {formatDate(doc.upload_date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getDocumentTypeIcon(doc.file_type)}
                      <span className="ml-2 text-sm">{doc.file_size}</span>
                    </div>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TenantDocuments;
