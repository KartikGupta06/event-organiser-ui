import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import CertificateAssignmentForm from "@/components/CertificateAssignmentForm";
import { Award, Search, Filter, Plus, Loader2, Calendar, FileText, Printer, Sparkles, X, ChevronRight, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCertificates } from "@/hooks/useCertificates";
import { useAuth } from "@/contexts/AuthContext";

const Certificates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [activePreview, setActivePreview] = useState<any | null>(null);
  
  const { toast } = useToast();
  const { certificates, loading, error, downloadCertificate, fetchCertificates } = useCertificates();
  const { isAdmin } = useAuth();

  const filteredCertificates = certificates.filter(cert => {
    const certName = cert.name || "";
    const certEventName = cert.event_name || "";
    const certRecipientName = cert.recipient_name || "";

    const matchesSearch = certName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          certEventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          certRecipientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" || cert.certificate_type === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getTemplateStyle = (url?: string | null) => {
    if (!url) return 'gold';
    if (url.includes('template=teal')) return 'teal';
    if (url.includes('template=violet')) return 'violet';
    return 'gold';
  };

  const handleDownload = async (certificate: typeof certificates[0]) => {
    if (!certificate.download_url) {
      toast({
        title: "File Unavailable",
        description: "This certificate doesn't have an associated download file.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Stripped template query from filename if exists
      const cleanUrl = certificate.download_url.split('?')[0];
      const fileName = cleanUrl.split('/').pop() || '';
      
      const { error } = await downloadCertificate(certificate.id, fileName);
      
      if (error) throw new Error(error);
      
      toast({
        title: "Download Started",
        description: `Downloading ${certificate.name}.pdf...`,
      });
    } catch (err: any) {
      toast({
        title: "Download Failed",
        description: err.message || "Failed to download PDF ticket.",
        variant: "destructive",
      });
    }
  };

  const getCertificateTypeColor = (type: string) => {
    switch (type) {
      case 'participation': return "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20";
      case 'completion': return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20";
      case 'achievement': return "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20";
      default: return "bg-secondary text-text-secondary border-border";
    }
  };

  const getCertificateTypeLabel = (type: string) => {
    const labels = {
      participation: "Participation Badge",
      completion: "Course Completion",
      achievement: "Achievement Plaque",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleAssignmentSuccess = () => {
    fetchCertificates();
    setShowAssignmentForm(false);
  };

  // Live print trigger
  const handlePrint = () => {
    const printContent = document.getElementById("certificate-print-plaque");
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore standard React bindings
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs text-text-secondary font-medium tracking-wide">Syncing Credentials Vault...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-10">
          <Card className="border-destructive/30 bg-destructive/5 rounded-3xl p-8 text-center max-w-md mx-auto">
            <CardContent className="p-0">
              <p className="text-destructive font-bold mb-2">Error Syncing Vault</p>
              <p className="text-xs text-text-secondary">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface pb-16">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="glass-panel p-8 rounded-3xl border border-white/50 dark:border-white/5 shadow-xl mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4.5 w-4.5 text-primary animate-float" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Digital Achievements Vault</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">Verified Credentials</h1>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
              {isAdmin 
                ? "Oversee template assignment lists, preview student certificates in real-time, and download PDF catalogs." 
                : "Browse your verified achievements, inspect gold-stamped plaques in browser, and print copies."}
            </p>
          </div>
          
          {isAdmin && (
            <Dialog open={showAssignmentForm} onOpenChange={setShowAssignmentForm}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:shadow-glow rounded-xl font-semibold text-white transition-all duration-300">
                  <Plus className="h-4.5 w-4.5 mr-2" />
                  Assign Certificate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl rounded-3xl glass-panel border border-white/50 dark:border-white/10 shadow-2xl p-6">
                <CertificateAssignmentForm
                  onClose={() => setShowAssignmentForm(false)}
                  onSuccess={handleAssignmentSuccess}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-text-tertiary" />
            <Input
              placeholder="Search by event, recipient, or certificate name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-white/50 dark:bg-black/10 border-border/80 rounded-xl focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="flex p-1 bg-secondary/50 rounded-xl border border-border/50 overflow-x-auto gap-1 shrink-0">
            {[
              { id: 'all', label: 'All Badges' },
              { id: 'participation', label: 'Participation' },
              { id: 'completion', label: 'Completion' },
              { id: 'achievement', label: 'Achievement' }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={filter === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(tab.id)}
                className={`h-9 px-4 rounded-lg text-xs font-semibold ${
                  filter === tab.id 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Certificate Display Catalog */}
        {filteredCertificates.length === 0 ? (
          <Card className="glass-card py-20 text-center">
            <Award className="h-16 w-16 text-text-tertiary mx-auto mb-4 animate-float" />
            <h3 className="text-lg font-bold text-text-primary mb-2">No certificates found</h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto mb-6">
              {searchTerm 
                ? "Try adjusting your search filters or input terms." 
                : isAdmin 
                  ? "Launch the 'Assign Certificate' drawer to dispatch digital plaques to students." 
                  : "Verified credentials will arrive in your vault once events are completed."
              }
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => {
              const tmpl = getTemplateStyle(certificate.download_url);
              
              return (
                <Card 
                  key={certificate.id} 
                  className="glass-card-interactive flex flex-col justify-between overflow-hidden border border-white/50 dark:border-white/10"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="outline" className={`${getCertificateTypeColor(certificate.certificate_type)} text-[10px] font-bold py-0.5 rounded-lg border`}>
                        {getCertificateTypeLabel(certificate.certificate_type)}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold text-text-primary tracking-tight line-clamp-1">{certificate.name}</CardTitle>
                    <CardDescription className="text-xs text-text-secondary font-medium">Event: {certificate.event_name}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2 p-3 bg-secondary/35 dark:bg-card/45 rounded-2xl border border-border/40 text-[11px]">
                      <div className="flex justify-between"><span className="text-text-secondary">Recipient:</span> <strong className="text-text-primary">{certificate.recipient_name}</strong></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Issued:</span> <strong className="text-text-primary">{new Date(certificate.issue_date || '').toLocaleDateString()}</strong></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Plaque Frame:</span> <strong className="text-text-primary capitalize">{tmpl} Theme</strong></div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        onClick={() => setActivePreview(certificate)}
                        className="flex-1 h-10 text-xs font-bold bg-secondary hover:bg-secondary/70 border border-border/80 rounded-xl"
                      >
                        <Eye className="h-3.5 w-3.5 mr-2 text-primary" />
                        Preview Plaque
                      </Button>
                      <Button
                        onClick={() => handleDownload(certificate)}
                        disabled={!certificate.download_url}
                        className="h-10 px-4 bg-gradient-primary hover:shadow-glow text-white rounded-xl text-xs font-bold"
                      >
                        PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* HTML / Print Certificate Preview Dialog Modal */}
      <Dialog open={!!activePreview} onOpenChange={(open) => !open && setActivePreview(null)}>
        {activePreview && (
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl p-6 border border-white/50 dark:border-white/10 shadow-2xl glass-panel flex flex-col justify-between">
            <DialogHeader className="mb-6 flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <div>
                  <DialogTitle className="text-base font-bold text-text-primary">HTML Plaque Showcase</DialogTitle>
                  <DialogDescription className="text-[10px] text-text-secondary mt-0.5">
                    Official verified credential. Securely hosted on college domains.
                  </DialogDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setActivePreview(null)} className="rounded-full h-8 w-8 hover:bg-secondary">
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            {/* Certificate Template Plaque Container */}
            <div className="flex-1 flex justify-center py-6 px-2 overflow-x-auto">
              <div 
                id="certificate-print-plaque"
                className={`w-[800px] h-[560px] relative p-12 shrink-0 flex flex-col justify-between text-center select-none shadow-2xl border-8 rounded-3xl transition-colors duration-500 bg-white ${
                  getTemplateStyle(activePreview.download_url) === 'gold' 
                    ? 'border-amber-400/80 bg-amber-50/5' 
                    : getTemplateStyle(activePreview.download_url) === 'teal'
                      ? 'border-emerald-400/80 bg-emerald-50/5'
                      : 'border-purple-400/80 bg-purple-50/5'
                }`}
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {/* Visual Stamp Ribbon */}
                <div className="absolute top-8 right-12 flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 bg-white ${
                    getTemplateStyle(activePreview.download_url) === 'gold' 
                      ? 'border-amber-400 text-amber-500' 
                      : getTemplateStyle(activePreview.download_url) === 'teal'
                        ? 'border-emerald-400 text-emerald-500'
                        : 'border-purple-400 text-purple-500'
                  }`}>
                    <Award className="h-7 w-7" />
                  </div>
                  <span className="text-[7px] uppercase font-sans font-bold tracking-widest text-gray-400 mt-1">Verified Plaque</span>
                </div>

                {/* Top Border corner lines */}
                <div className="space-y-4">
                  <span className={`text-[10px] tracking-[0.3em] font-sans font-extrabold uppercase ${
                    getTemplateStyle(activePreview.download_url) === 'gold' 
                      ? 'text-amber-500' 
                      : getTemplateStyle(activePreview.download_url) === 'teal'
                        ? 'text-emerald-500'
                        : 'text-purple-500'
                  }`}>
                    Certificate of {activePreview.certificate_type}
                  </span>
                  <div className="w-16 h-0.5 bg-gray-300 mx-auto" />
                </div>

                {/* Calligraphic Body */}
                <div className="space-y-6 my-auto text-gray-800">
                  <p className="text-sm font-sans font-light italic text-gray-500">This credential is proudly presented to</p>
                  <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 leading-none py-1">
                    {activePreview.recipient_name}
                  </h2>
                  <p className="text-sm font-sans font-light text-gray-600 max-w-md mx-auto leading-relaxed">
                    for outstanding performance and successful fulfillment of all required criteria scheduled for the workshop
                  </p>
                  <h3 className="text-xl font-bold tracking-tight text-gray-900">
                    {activePreview.event_name}
                  </h3>
                </div>

                {/* Footer signatures */}
                <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                  <div className="text-left">
                    <p className="text-xs font-sans text-gray-900 font-bold">EventHub Committee</p>
                    <p className="text-[9px] font-sans font-medium text-gray-400">Official Issuer</p>
                  </div>
                  <div className="text-center font-sans">
                    <p className="text-[10px] text-gray-400">Issue Date</p>
                    <p className="text-xs font-bold text-gray-900">{new Date(activePreview.issue_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-sans text-gray-900 font-bold">University Registrar</p>
                    <p className="text-[9px] font-sans font-medium text-gray-400">Verified Stamp</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plaque Operations controls */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="rounded-xl h-11 px-5 text-xs font-bold border-border"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Plaque Copy
              </Button>
              <Button 
                onClick={() => handleDownload(activePreview)}
                disabled={!activePreview.download_url}
                className="bg-gradient-primary hover:shadow-glow text-white rounded-xl h-11 px-6 text-xs font-bold"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download PDF Document
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Certificates;