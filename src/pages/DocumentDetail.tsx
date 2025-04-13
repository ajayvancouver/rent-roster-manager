
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, FileText, User, Building, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { documentsService } from "@/services/documentsService";
import { Document } from "@/types";

const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await documentsService.getById(id);
        
        if (error) throw error;
        
        setDocument(data);
      } catch (error) {
        console.error("Error fetching document:", error);
        toast({
          title: "Error",
          description: "Could not load document details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const formatFileSize = (sizeInBytes: string) => {
    const size = parseInt(sizeInBytes);
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    else if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    else return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case "lease":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "payment":
        return "bg-green-100 text-green-800 border-green-300";
      case "maintenance":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "other":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getIconForFileType = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-16 w-16 text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileText className="h-16 w-16 text-blue-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-16 w-16 text-blue-700" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <FileText className="h-16 w-16 text-green-700" />;
    } else {
      return <FileText className="h-16 w-16 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/documents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Document Details</h1>
          <p className="text-muted-foreground">View details and access document</p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-full max-w-sm" />
            <Skeleton className="h-4 w-full max-w-xs mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : document ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap justify-between items-center gap-2">
                <CardTitle>{document.name}</CardTitle>
                <Badge className={getDocumentTypeColor(document.type)}>
                  {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                </Badge>
              </div>
              <CardDescription>
                Uploaded on {formatDate(document.uploadDate)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-6 border border-dashed rounded-lg">
                {getIconForFileType(document.fileType)}
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {document.fileType}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {document.tenantName && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Tenant</h3>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{document.tenantName}</span>
                    </div>
                  </div>
                )}
                {document.propertyName && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Property</h3>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{document.propertyName}</span>
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Upload Date</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(document.uploadDate)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">File Type</h3>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{document.fileType}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex flex-wrap gap-2 w-full">
                <Button className="flex-1" asChild>
                  <a href={document.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Document
                  </a>
                </Button>
                <Button className="flex-1" variant="outline" asChild>
                  <a href={document.url} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Related Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.tenantId && (
                <Button className="w-full" variant="outline" asChild>
                  <Link to={`/tenants/${document.tenantId}`}>
                    <User className="mr-2 h-4 w-4" />
                    View Tenant
                  </Link>
                </Button>
              )}
              {document.propertyId && (
                <Button className="w-full" variant="outline" asChild>
                  <Link to={`/properties/${document.propertyId}`}>
                    <Building className="mr-2 h-4 w-4" />
                    View Property
                  </Link>
                </Button>
              )}
              <Button className="w-full" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Upload New Version
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-lg text-center text-muted-foreground">
              Document not found. It may have been deleted or you don't have access.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/documents">Return to Documents</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentDetail;
