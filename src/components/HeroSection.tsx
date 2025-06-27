
import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  onScrollToFeatures: () => void;
}

const HeroSection = ({ onScrollToFeatures }: HeroSectionProps) => {
  return (
    <header className="section-padding text-center">
      <div className="container-responsive max-w-4xl">
        {/* Prominent Logo and Name */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/lovable-uploads/9fb20310-6359-4b6d-8835-5bce032472bc.png" 
            alt="PadLock Insurance Logo" 
            className="h-16 md:h-20 w-auto mb-4" 
            loading="eager"
            width="80"
            height="80"
          />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 mb-2">
            Padlock
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-8">
            Your Smart Insurance Companion
          </p>
        </div>
        
        <Badge variant="secondary" className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-base md:text-lg px-4 md:px-6 py-2 md:py-3 border border-purple-200">
          <Sparkles className="w-4 h-4 mr-2" />
          AI-Powered Insurance Management
        </Badge>
        
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Revolutionise how you manage insurance with AI-powered insights, seamless policy tracking, and intelligent recommendations tailored just for you.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="w-full sm:w-auto text-lg px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg" asChild>
            <Link to="/auth" aria-label="Start your free trial today">
              Start Free Today
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto text-lg px-6 md:px-8 py-3 md:py-4 border-purple-300 text-purple-700 hover:bg-purple-50" 
            onClick={onScrollToFeatures}
            aria-label="Learn more about Padlock features"
          >
            Learn More
            <ChevronRight className="ml-2 w-5 h-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
