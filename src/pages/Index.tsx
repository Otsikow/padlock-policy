
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CurrencySelector from '@/components/CurrencySelector';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import PricingSection from '@/components/PricingSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    // Update page title and meta description
    document.title = 'Padlock - AI-Powered Insurance Management & Optimization';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Revolutionize your insurance management with AI-powered insights, policy tracking, and intelligent recommendations. Compare deals, manage claims, and optimize coverage seamlessly.');
    }
  }, []);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between section-padding bg-white/90 backdrop-blur-sm border-b border-purple-100 shadow-sm" role="navigation" aria-label="Main navigation">
        <div className="flex items-center space-x-4">
          <CurrencySelector minimal={true} />
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-purple-700 hover:text-purple-900" asChild>
            <Link to="/auth" aria-label="Sign in to your account">Sign In</Link>
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" asChild>
            <Link to="/auth" aria-label="Get started with Padlock">Get Started</Link>
          </Button>
        </div>
      </nav>

      <HeroSection onScrollToFeatures={scrollToFeatures} />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
