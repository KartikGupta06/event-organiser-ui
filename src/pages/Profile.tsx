import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfilePictureUpload from '@/components/profile/ProfilePictureUpload';
import EventParticipationHistory from '@/components/profile/EventParticipationHistory';
import ProfileCertificates from '@/components/profile/ProfileCertificates';
import ProfileSettings from '@/components/profile/ProfileSettings';
import { User, GraduationCap, CalendarDays, Award, Settings, ShieldCheck, Mail, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <Navigation />
        <div className="container mx-auto px-6 py-12 text-center text-sm text-text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          Synchronizing credentials data...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <Navigation />
        <div className="max-w-md mx-auto px-6 py-20 text-center">
          <div className="glass-panel p-8 rounded-3xl border border-destructive/20 bg-destructive/5 shadow-xl">
            <h2 className="text-xl font-bold text-destructive mb-2">Profile Sync Failed</h2>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              We couldn't synchronize your student achievements profile. This usually happens due to database connectivity issues or missing records.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => window.location.reload()} className="w-full bg-primary text-white rounded-xl">
                Retry Connection
              </Button>
              <Button onClick={() => signOut()} variant="outline" className="w-full border-border rounded-xl">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    const name = profile?.full_name || profile?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-surface pb-16">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Cinematic Header profile card */}
        <div className="glass-panel p-8 rounded-3xl border border-white/50 dark:border-white/5 shadow-xl mb-10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          
          <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg shrink-0">
            <AvatarImage src={profile.profile_picture_url || undefined} alt="Profile" />
            <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
              {getInitials() || <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">{profile.full_name || "Active Student"}</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg border border-primary/25">
                {profile.role === 'admin' ? 'Administrator' : 'Student Partner'}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-y-1 gap-x-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-primary" /> {profile.email}</span>
              {profile.branch && <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-primary" /> {profile.branch}</span>}
            </div>
          </div>

          {/* Gamified metric totals badges */}
          <div className="grid grid-cols-2 gap-4 shrink-0 w-full md:w-auto">
            <div className="p-4 bg-secondary/35 dark:bg-card/45 rounded-2xl border border-border text-center">
              <span className="text-2xl font-black text-primary block">Active</span>
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-text-secondary">Profile Role</span>
            </div>
            <div className="p-4 bg-secondary/35 dark:bg-card/45 rounded-2xl border border-border text-center">
              <span className="text-2xl font-black text-emerald-500 block">100%</span>
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-text-secondary">Verified Claims</span>
            </div>
          </div>
        </div>

        {/* Tab content navigation controls */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="flex p-1.5 bg-secondary/50 rounded-2xl border border-border/50 overflow-x-auto gap-1">
            {[
              { id: 'personal', label: 'Personal details', icon: User },
              { id: 'academic', label: 'Academic profile', icon: GraduationCap },
              { id: 'events', label: 'Event History', icon: CalendarDays },
              { id: 'certificates', label: 'Vault Badges', icon: Award },
              { id: 'settings', label: 'Preferences', icon: Settings }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 h-10 px-5 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-text-secondary hover:text-text-primary"
                >
                  <TabIcon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Personal Details */}
          <TabsContent value="personal" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4">
                <Card className="glass-card overflow-hidden">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-base font-bold text-text-primary">Avatar Generator</CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-0.5">Customize your official student thumbnail.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ProfilePictureUpload />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8">
                <Card className="glass-card overflow-hidden">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-base font-bold text-text-primary">Personal Credentials</CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-0.5">Update biological descriptors and contact detail vectors.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ProfileForm type="personal" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Academic Info */}
          <TabsContent value="academic" className="outline-none">
            <Card className="glass-card overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base font-bold text-text-primary">Academic Descriptors</CardTitle>
                <CardDescription className="text-xs text-text-secondary mt-0.5">Maintain university registrar fields and roll values.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ProfileForm type="academic" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event History */}
          <TabsContent value="events" className="outline-none">
            <Card className="glass-card overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4.5 w-4.5 text-primary" />
                  <div>
                    <CardTitle className="text-base font-bold text-text-primary">Participation Logbook</CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-0.5">Historical overview of registered event deadlines and workshop tickets.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <EventParticipationHistory />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates list */}
          <TabsContent value="certificates" className="outline-none">
            <Card className="glass-card overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-primary" />
                  <div>
                    <CardTitle className="text-base font-bold text-text-primary">Verified Plaques vault</CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-0.5">Inspect issued gold medals and course completion badges.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ProfileCertificates />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings / Options Preferences */}
          <TabsContent value="settings" className="outline-none">
            <Card className="glass-card overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4.5 w-4.5 text-primary" />
                  <div>
                    <CardTitle className="text-base font-bold text-text-primary">Preferences & Settings</CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-0.5">Configure system-wide dispatch toggles and notifications.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ProfileSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
