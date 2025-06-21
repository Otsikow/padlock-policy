
import { Shield, Users, Award, ChevronRight, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import PriceDisplay from '@/components/PriceDisplay';
import CurrencySelector from '@/components/CurrencySelector';

const Index = () => {
  const features = [
    {
      icon: Shield,
      title: "AI-Powered Protection",
      description: "Smart analysis of your insurance policies with instant recommendations"
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "24/7 access to insurance professionals and personalized guidance"
    },
    {
      icon: Award,
      title: "Best Value Guarantee",
      description: "Compare rates across top insurers to ensure you get the best deal"
    }
  ];

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started",
      price: 0,
      currency: "GBP",
      features: [
        "Basic policy management",
        "Document storage (up to 5 files)",
        "Simple claims tracking",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Premium",
      description: "Most popular for individuals",
      price: 9.99,
      currency: "GBP",
      features: [
        "Everything in Free",
        "AI policy analysis",
        "Unlimited document storage",
        "Priority support",
        "Smart reminders",
        "Risk assessments"
      ],
      popular: true
    },
    {
      name: "Family",
      description: "Perfect for families",
      price: 19.99,
      currency: "GBP",
      features: [
        "Everything in Premium",
        "Up to 6 family members",
        "Family dashboard",
        "Bulk policy management",
        "Advanced analytics",
        "Dedicated account manager"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/6f4f2ad0-19b7-4654-b9bf-35b79aadc6b7.png"
            alt="PadLock Insurance Logo"
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold text-gray-900">PadLock</span>
        </div>
        <div className="flex items-center space-x-4">
          <CurrencySelector />
          <Button variant="ghost" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-800">
            🚀 AI-Powered Insurance Management
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Smart
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block">
              Insurance Companion
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Revolutionize how you manage insurance with AI-powered insights, 
            seamless policy tracking, and intelligent recommendations tailored just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <Link to="/auth">
                Start Free Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4" asChild>
              <Link to="#features">
                Learn More
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose PadLock?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of insurance management with cutting-edge technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-gray-600 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your insurance management needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {plan.description}
                  </CardDescription>
                  <div className="mb-4">
                    <PriceDisplay 
                      baseAmount={plan.price}
                      baseCurrency={plan.currency}
                      size="lg"
                      showBadge={false}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to="/auth">
                      {plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Insurance Experience?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands who trust PadLock to manage their insurance policies smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
              <Link to="/auth">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/6f4f2ad0-19b7-4654-b9bf-35b79aadc6b7.png"
                alt="PadLock Insurance Logo"
                className="h-8 w-auto"
              />
              <span className="text-lg font-semibold">PadLock Insurance</span>
            </div>
            <p className="text-gray-400">
              © 2024 PadLock Insurance. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
