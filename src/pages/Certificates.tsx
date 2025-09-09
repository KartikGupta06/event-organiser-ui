import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Download, Award, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Mock certificate data
const certificates = [
  {
    id: 1,
    name: "Tech Conference 2024 - Participation Certificate",
    eventName: "Tech Conference 2024",
    recipientName: "John Doe",
    issueDate: "2024-01-15",
    type: "participation",
    downloadUrl: "#",
  },
  {
    id: 2,
    name: "Design Workshop - Completion Certificate",
    eventName: "Design Workshop Series",
    recipientName: "Jane Smith",
    issueDate: "2024-01-20",
    type: "completion",
    downloadUrl: "#",
  },
  {
    id: 3,
    name: "Startup Pitch - Winner Certificate",
    eventName: "Startup Pitch Competition",
    recipientName: "Alex Johnson",
    issueDate: "2024-02-05",
    type: "achievement",
    downloadUrl: "#",
  },
  {
    id: 4,
    name: "Innovation Summit - Speaker Certificate",
    eventName: "Innovation Summit 2024",
    recipientName: "Sarah Wilson",
    issueDate: "2024-02-10",
    type: "speaker",
    downloadUrl: "#",
  },
];

const Certificates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.recipientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" || cert.type === filter;
    
    return matchesSearch && matchesFilter;
  });

  const handleDownload = (certificate: typeof certificates[0]) => {
    // Simulate certificate download
    toast({
      title: "Download Started",
      description: `Downloading ${certificate.name}`,
    });
  };

  const getCertificateTypeColor = (type: string) => {
    const colors = {
      participation: "bg-primary text-primary-foreground",
      completion: "bg-success text-success-foreground",
      achievement: "bg-warning text-warning-foreground",
      speaker: "bg-destructive text-destructive-foreground",
    };
    return colors[type as keyof typeof colors] || "bg-secondary text-secondary-foreground";
  };

  const getCertificateTypeLabel = (type: string) => {
    const labels = {
      participation: "Participation",
      completion: "Completion",
      achievement: "Achievement",
      speaker: "Speaker",
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Certificate Vault</h1>
          <p className="text-text-secondary">Manage and download event certificates</p>
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
                      {certificates.filter(c => c.type === type).length}
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
                {searchTerm ? "Try adjusting your search terms" : "Certificates will appear here as events are completed"}
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
                        Event: {certificate.eventName}
                      </CardDescription>
                    </div>
                    <Badge className={getCertificateTypeColor(certificate.type)}>
                      {getCertificateTypeLabel(certificate.type)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-text-secondary">
                        <strong>Recipient:</strong> {certificate.recipientName}
                      </p>
                      <p className="text-sm text-text-secondary">
                        <strong>Issued:</strong> {new Date(certificate.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => handleDownload(certificate)}
                      className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
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