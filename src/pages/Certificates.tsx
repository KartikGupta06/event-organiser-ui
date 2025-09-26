import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import CertificateAssignmentForm from "@/components/CertificateAssignmentForm";
import { Download, Award, Search, Filter, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCertificates } from "@/hooks/useCertificates";
import { useAuth } from "@/contexts/AuthContext";

const Certificates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  
  const { toast } = useToast();
  const { certificates, loading, error, downloadCertificate, fetchCertificates } = useCertificates();
  const { isAdmin } = useAuth();

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.recipient_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" || cert.certificate_type === filter;
    
    return matchesSearch && matchesFilter;
  });

  const handleDownload = async (certificate: typeof certificates[0]) => {
    if (!certificate.download_url) {
      toast({
        title: "No file available",
        description: "This certificate doesn't have a downloadable file",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileName = certificate.download_url.split('/').pop() || '';
      const { error } = await downloadCertificate(certificate.id, fileName);
      
      if (error) throw new Error(error);
      
      toast({
        title: "Download Started",
        description: `Downloading ${certificate.name}`,
      });
    } catch (err: any) {
      toast({
        title: "Download Failed",
        description: err.message || "Failed to download certificate",
        variant: "destructive",
      });
    }
  };

  const getCertificateTypeColor = (type: string) => {
    const colors = {
      participation: "bg-primary text-primary-foreground",
      completion: "bg-green-600 text-white",
      achievement: "bg-yellow-600 text-white",
    };
    return colors[type as keyof typeof colors] || "bg-secondary text-secondary-foreground";
  };

  const getCertificateTypeLabel = (type: string) => {
    const labels = {
      participation: "Participation",
      completion: "Completion",
      achievement: "Achievement",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleAssignmentSuccess = () => {
    fetchCertificates();
    setShowAssignmentForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Card className="border-destructive">
            <CardContent className="text-center py-12">
              <p className="text-destructive">Error loading certificates: {error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Certificate Vault</h1>
              <p className="text-text-secondary">
                {isAdmin ? "Manage and assign event certificates" : "View and download your certificates"}
              </p>
            </div>
            
            {isAdmin && (
              <Dialog open={showAssignmentForm} onOpenChange={setShowAssignmentForm}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Certificate
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <CertificateAssignmentForm
                    onClose={() => setShowAssignmentForm(false)}
                    onSuccess={handleAssignmentSuccess}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <Input
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border focus:ring-primary"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>All</span>
            </Button>
            <Button
              variant={filter === "participation" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("participation")}
            >
              Participation
            </Button>
            <Button
              variant={filter === "completion" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completion")}
            >
              Completion
            </Button>
            <Button
              variant={filter === "achievement" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("achievement")}
            >
              Achievement
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-text-secondary">Total Certificates</p>
                  <p className="text-2xl font-bold text-text-primary">{certificates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {["participation", "completion", "achievement"].map(type => (
            <Card key={type} className="border-border shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-text-secondary capitalize">{type}</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {certificates.filter(c => c.certificate_type === type).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certificates Grid */}
        {filteredCertificates.length === 0 ? (
          <Card className="border-border shadow">
            <CardContent className="text-center py-12">
              <Award className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {searchTerm ? "No certificates found" : "No certificates yet"}
              </h3>
              <p className="text-text-secondary">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : isAdmin 
                    ? "Use the 'Assign Certificate' button to create certificates" 
                    : "Certificates will appear here as events are completed"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredCertificates.map((certificate) => (
              <Card key={certificate.id} className="border-border shadow hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="h-5 w-5 text-primary" />
                        <CardTitle className="text-text-primary">{certificate.name}</CardTitle>
                      </div>
                      <CardDescription className="text-text-secondary">
                        Event: {certificate.event_name}
                      </CardDescription>
                    </div>
                    <Badge className={getCertificateTypeColor(certificate.certificate_type)}>
                      {getCertificateTypeLabel(certificate.certificate_type)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-text-secondary">
                        <strong>Recipient:</strong> {certificate.recipient_name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        <strong>Issued:</strong> {new Date(certificate.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => handleDownload(certificate)}
                      disabled={!certificate.download_url}
                      className="bg-gradient-primary hover:shadow-glow transition-all duration-300 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Certificates;