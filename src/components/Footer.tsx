
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    
    // Simulate newsletter signup
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      setEmail('');
      setIsSubscribing(false);
    }, 1000);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-purple-900 text-white relative" role="contentinfo">
      {/* Back to Top Button */}
      <Button
        onClick={scrollToTop}
        className="absolute -top-6 right-8 bg-purple-600 hover:bg-purple-700 rounded-full p-3 shadow-lg"
        size="sm"
        aria-label="Back to top"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>

      <div className="container-responsive max-w-7xl section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          
          {/* Brand & About Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/lovable-uploads/9fb20310-6359-4b6d-8835-5bce032472bc.png" 
                alt="PadLock Insurance Logo" 
                className="h-10 w-auto" 
                loading="lazy"
                width="40"
                height="40"
              />
              <span className="text-xl font-bold">Padlock</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Revolutionizing insurance management with AI-powered insights, intelligent recommendations, and seamless policy tracking for modern consumers.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="bg-gray-700 text-gray-200 hover:bg-gray-600">
                SOC 2 Compliant
              </Badge>
              <Badge variant="secondary" className="bg-gray-700 text-gray-200 hover:bg-gray-600">
                GDPR Ready
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="#features" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="#pricing" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    Sign In
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal & Support</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms-conditions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a 
                  href="/cookie-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a 
                  href="/accessibility" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Accessibility
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Stay Connected</h3>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <a href="mailto:support@padlock.com" className="hover:text-white transition-colors">
                  support@padlock.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <a href="tel:+1-800-PADLOCK" className="hover:text-white transition-colors">
                  +1 (800) PADLOCK
                </a>
              </div>
              <div className="flex items-start space-x-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>123 Innovation Drive<br />Tech City, TC 12345</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4 mb-6">
              <a 
                href="https://facebook.com/padlock" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/padlock" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com/company/padlock" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com/padlock" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>

            {/* Newsletter Signup */}
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <label htmlFor="newsletter-email" className="text-sm font-medium text-gray-200">
                Subscribe to Updates
              </label>
              <div className="flex space-x-2">
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isSubscribing}
                  className="bg-purple-600 hover:bg-purple-700 px-4"
                >
                  {isSubscribing ? "..." : "Subscribe"}
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Get updates on new features and insurance insights.
              </p>
            </form>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
            <p>© 2025 Padlock Insurance Technologies, Inc. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span>Padlock™ is a registered trademark</span>
            </div>
          </div>
          
          {/* Regulatory & Certification Info */}
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>FCA Regulated</span>
            <Separator orientation="vertical" className="h-4 bg-gray-600" />
            <span>ISO 27001 Certified</span>
          </div>
        </div>

        {/* Additional Legal Notice */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Padlock Insurance is authorized and regulated by the Financial Conduct Authority (FCA). 
            Insurance products are underwritten by our panel of carefully selected insurers. 
            Padlock Technologies Ltd is registered in England and Wales (Company No. 12345678).
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
