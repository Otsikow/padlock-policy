
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="section-padding bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white" aria-labelledby="cta-title">
      <div className="container-responsive max-w-4xl text-center">
        <h2 id="cta-title" className="text-3xl md:text-4xl font-bold mb-6 flex items-center justify-center gap-3">
          <Star className="h-8 w-8 text-yellow-300" />
          Ready to Transform Your Insurance Experience?
        </h2>
        <p className="text-lg md:text-xl mb-8 text-purple-100">
          Join thousands who trust Padlock to manage their insurance policies more intelligently.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            variant="secondary" 
            className="w-full sm:w-auto text-lg px-6 md:px-8 py-3 md:py-4 bg-white text-purple-600 hover:bg-purple-50 shadow-lg" 
            asChild
          >
            <Link to="/auth" aria-label="Start your free trial now">
              Start Free Today
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
