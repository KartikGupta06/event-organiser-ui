import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Award, ArrowRight } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold text-text-primary">EventHub</span>
            </div>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-text-primary mb-6 leading-tight">
            Organize Events
            <span className="block text-primary">Effortlessly</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
            Streamline your event management with our intuitive platform. 
            Create, manage, and track events with ease.
          </p>
          
          <Link to="/login">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-surface p-8 rounded-xl shadow border border-border hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">Event Management</h3>
            <p className="text-text-secondary">
              Create and manage events with detailed information, rules, and registration deadlines.
            </p>
          </div>

          <div className="bg-surface p-8 rounded-xl shadow border border-border hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">Registration Links</h3>
            <p className="text-text-secondary">
              Generate and share registration links for seamless participant enrollment.
            </p>
          </div>

          <div className="bg-surface p-8 rounded-xl shadow border border-border hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-3">Certificate Vault</h3>
            <p className="text-text-secondary">
              Store and manage downloadable certificates for event participants.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-text-secondary">
            <p>&copy; 2024 EventHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;