
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Smartphone, Bot, Users, ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigate('/dashboard');
    }
  };

  const features = [
    {
      icon: Shield,
      title: "AI-Powered Analysis",
      description: "Get instant insights and recommendations for your insurance policies using advanced AI."
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Access your policies anywhere, anytime. Our responsive design works perfectly on all devices."
    },
    {
      icon: Bot,
      title: "Smart Notifications",
      description: "Never miss a renewal date or claim deadline with our intelligent reminder system."
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "Get help from our insurance experts whenever you need guidance or support."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content: "Padlock helped me organize all my business insurance policies in one place. The AI analysis saved me hundreds on my premiums!"
    },
    {
      name: "Michael Chen",
      role: "Family Man",
      content: "Managing our family's insurance used to be overwhelming. Now everything is simple and I never miss important dates."
    },
    {
      name: "Emma Wilson",
      role: "Property Investor",
      content: "The claims assistance feature was invaluable when I had to file a claim. Couldn't have done it without Padlock."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/da2d5e44-7846-4551-bd2b-b08a7a2190dc.png" 
                alt="Padlock Logo" 
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="space-x-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/da2d5e44-7846-4551-bd2b-b08a7a2190dc.png" 
              alt="Padlock Logo" 
              className="h-16 w-auto object-contain mx-auto mb-6"
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Your Insurance,
            <span className="text-blue-600"> Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Take control of your insurance with AI-powered analysis, smart notifications, and expert guidance. 
            Stop overpaying and never miss important deadlines again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              Start Free Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/upgrade')}
              className="text-lg px-8 py-3"
            >
              View Pricing
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Free forever • No credit card required • 2 minute setup
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to manage insurance
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to make insurance simple and stress-free
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by thousands of users
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about Padlock
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to take control of your insurance?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have simplified their insurance management with Padlock
          </p>
          <Button
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/lovable-uploads/da2d5e44-7846-4551-bd2b-b08a7a2190dc.png" 
              alt="Padlock Logo" 
              className="h-8 w-auto object-contain filter brightness-0 invert"
            />
          </div>
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              © 2024 Padlock. All rights reserved.
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
