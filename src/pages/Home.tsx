import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Award, ArrowRight, ShieldCheck, Zap, Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const Home = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-surface relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[150px] pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/40 dark:bg-background/25 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-text-primary">EventHub</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl h-9 w-9 text-text-secondary hover:text-text-primary hover:bg-secondary/40 transition-all duration-300"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4.5 w-4.5 text-amber-400 animate-float" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-indigo-500" />
              )}
            </Button>
            
            <Link to="/auth">
              <Button variant="outline" size="sm" className="rounded-xl px-5 h-9 font-semibold hover:bg-primary/5 hover:text-primary transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          {/* Subheading Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6 animate-float">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Event Management Re-Imagined</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-text-primary mb-8 tracking-tight leading-none">
            Organize College Events
            <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mt-2">
              With Pure Perfection
            </span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed font-light">
            Streamline registrations, design custom participant forms, issue luxury certificates, and visualize analytics — all inside a stunning, modern workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="h-13 px-8 bg-gradient-primary hover:shadow-glow transition-all duration-300 rounded-2xl text-white font-semibold text-sm">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="ghost" size="lg" className="h-13 px-8 rounded-2xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-secondary/40">
                Explore Features
              </Button>
            </a>
          </div>
        </div>

        {/* Live Mockup Interactive Showcase */}
        <div className="relative mx-auto max-w-5xl rounded-3xl p-2 bg-gradient-to-b from-white/30 to-white/10 dark:from-white/10 dark:to-transparent border border-white/40 dark:border-white/5 shadow-2xl mb-28">
          <div className="rounded-2.5xl overflow-hidden glass-panel border border-white/20 dark:border-white/5 aspect-[16/9] flex flex-col relative">
            
            {/* Header bar mock */}
            <div className="bg-secondary/50 border-b border-border/50 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="text-xs text-text-secondary font-mono bg-white/80 dark:bg-card/80 px-4 py-0.5 rounded-md border border-border/50">
                eventhub.domain/dashboard
              </div>
              <div className="w-12" />
            </div>

            {/* Dashboard preview components */}
            <div className="flex-1 p-6 grid grid-cols-12 gap-4 bg-background/50 dark:bg-background/25">
              <div className="col-span-3 space-y-3">
                <div className="h-8 bg-primary/10 rounded-lg animate-pulse" />
                <div className="h-6 bg-secondary/80 rounded-lg" />
                <div className="h-6 bg-secondary/80 rounded-lg" />
                <div className="h-6 bg-secondary/80 rounded-lg" />
              </div>
              <div className="col-span-9 grid grid-cols-3 gap-4">
                <div className="col-span-3 h-10 bg-secondary/60 rounded-xl" />
                <div className="h-28 bg-white dark:bg-card border border-border rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Active events</span>
                  <span className="text-2xl font-black text-primary">12</span>
                </div>
                <div className="h-28 bg-white dark:bg-card border border-border rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Registrations</span>
                  <span className="text-2xl font-black text-purple-600">1,482</span>
                </div>
                <div className="h-28 bg-white dark:bg-card border border-border rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Verified Claims</span>
                  <span className="text-2xl font-black text-emerald-500">98.2%</span>
                </div>
                <div className="col-span-3 h-32 bg-secondary/40 border border-border/50 rounded-2xl flex items-center justify-center text-xs text-text-tertiary">
                  Interactive Recharts Dashboard Visualization
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
              Packed with Upgraded Technologies
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto font-light">
              We replaced obsolete layouts with beautiful modern designs and high-fidelity features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Custom Form Builders</h3>
              <p className="text-text-secondary leading-relaxed text-sm font-light">
                Host custom text fields, date controls, and option dropdowns. Instantly preview your customized layout side-by-side inside the builder.
              </p>
            </div>

            <div className="glass-card p-8 hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Student Dashboards</h3>
              <p className="text-text-secondary leading-relaxed text-sm font-light">
                Empower your student participants to browse schedules, enroll dynamically, edit active profiles, and manage templates easily.
              </p>
            </div>

            <div className="glass-card p-8 hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Award className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Digital Certificate Vault</h3>
              <p className="text-text-secondary leading-relaxed text-sm font-light">
                Select between Royal Gold, Modern Teal, or Royal Violet templates. Generate verified in-browser HTML credentials with easy printing.
              </p>
            </div>
          </div>
        </section>

        {/* Highlights Row */}
        <section className="mt-28 py-12 border-y border-border/50 grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-white/20 dark:bg-card/10 backdrop-blur-md rounded-3xl px-6">
          <div>
            <div className="text-3xl font-black text-primary mb-1">50+</div>
            <div className="text-xs uppercase font-bold tracking-wider text-text-secondary">Total Events</div>
          </div>
          <div>
            <div className="text-3xl font-black text-purple-600 mb-1">10k+</div>
            <div className="text-xs uppercase font-bold tracking-wider text-text-secondary">Students Registered</div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-500 mb-1">100%</div>
            <div className="text-xs uppercase font-bold tracking-wider text-text-secondary">Digital Vault Delivery</div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-500 mb-1">3+</div>
            <div className="text-xs uppercase font-bold tracking-wider text-text-secondary">Luxury Templates</div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/40 dark:bg-background/25 border-t border-border/50 mt-32">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Calendar className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-text-primary">EventHub</span>
          </div>
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} EventHub System. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-xs text-text-secondary">
            <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
            <span>&bull;</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Terms of Use</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;