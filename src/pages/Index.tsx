import { Shield, Users, Award, ChevronRight, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import PriceDisplay from '@/components/PriceDisplay';
import CurrencySelector from '@/components/CurrencySelector';
import { subscriptionPlans } from '@/services/pricingService';
const Index = () => {
  const features = [{
    icon: Shield,
    title: "AI-Powered Protection",
    description: "Smart analysis of your insurance policies with instant recommendations"
  }, {
    icon: Users,
    title: "Expert Support",
    description: "24/7 access to insurance professionals and personalized guidance"
  }, {
    icon: Award,
    title: "Best Value Guarantee",
    description: "Compare rates across top insurers to ensure you get the best deal"
  }];

  // Use current plans from pricingService
  const plans = subscriptionPlans.map(plan => ({
    name: plan.name,
    description: plan.description,
    price: plan.prices.GBP,
    features: plan.features,
    popular: plan.id === 'pro',
    id: plan.id
  }));
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const getButtonText = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'Start Free Today';
      case 'pro':
        return 'Upgrade To Pro';
      case 'premium':
        return 'Upgrade To Premium';
      default:
        return 'Get Started';
    }
  };
  const getButtonStyles = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'pro':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'premium':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white';
      default:
        return '';
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white/90 backdrop-blur-sm border-b border-purple-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <CurrencySelector minimal={true} />
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-purple-700 hover:text-purple-900" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section with Centered Logo and Name */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Prominent Logo and Name */}
          <div className="flex flex-col items-center mb-8">
            <img src="/lovable-uploads/9fb20310-6359-4b6d-8835-5bce032472bc.png" alt="PadLock Insurance Logo" className="h-20 w-auto mb-4" />
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 mb-2">Padlock</h1>
            <p className="text-2xl font-semibold text-gray-700 mb-8">
              Your Smart Insurance Companion
            </p>
          </div>
          
          <Badge variant="secondary" className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-lg px-6 py-3 border border-purple-200">
            🚀 AI-Powered Insurance Management
          </Badge>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">Revolutionise how you manage insurance with AI-powered insights, seamless policy tracking, and intelligent recommendations tailored just for you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg" asChild>
              <Link to="/auth">
                Start Free Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-purple-300 text-purple-700 hover:bg-purple-50" onClick={scrollToFeatures}>
              Learn More
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-gradient-to-r from-white/80 to-purple-50/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Why Choose Padlock?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of insurance management with cutting-edge technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
            const Icon = feature.icon;
            return <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
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
                </Card>;
          })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your insurance management needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => <Card key={index} className={`relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:scale-105 ${plan.id === 'basic' ? 'ring-2 ring-green-400 shadow-green-100' : ''} ${plan.popular ? 'ring-2 ring-blue-400 shadow-blue-100' : ''} ${plan.id === 'premium' ? 'ring-2 ring-purple-400 shadow-purple-100 bg-gradient-to-br from-purple-50/50 to-pink-50/50' : ''}`}>
                {plan.id === 'basic' && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                    Free
                  </Badge>}
                {plan.popular && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                    Most Popular
                  </Badge>}
                {plan.id === 'premium' && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                    Premium
                  </Badge>}
                <CardHeader className="text-center">
                  <CardTitle className={`text-2xl font-bold ${plan.id === 'basic' ? 'text-green-700' : plan.id === 'premium' ? 'text-purple-700' : 'text-gray-900'}`}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {plan.description}
                  </CardDescription>
                  <div className="mb-4">
                    <PriceDisplay baseAmount={plan.price} baseCurrency="GBP" size="lg" showBadge={false} />
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.id === 'basic' ? 'text-green-500' : plan.id === 'premium' ? 'text-purple-500' : 'text-blue-500'}`} />
                        <span className="text-gray-600">{feature}</span>
                      </li>)}
                  </ul>
                  <Button className={`w-full shadow-lg ${getButtonStyles(plan.id)}`} asChild>
                    <Link to="/auth">
                      {getButtonText(plan.id)}
                    </Link>
                  </Button>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Insurance Experience?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Join thousands who trust PadLock to manage their insurance policies smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white text-purple-600 hover:bg-purple-50 shadow-lg" asChild>
              <Link to="/auth">
                Start Free Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-purple-900 text-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/lovable-uploads/9fb20310-6359-4b6d-8835-5bce032472bc.png" alt="PadLock Insurance Logo" className="h-8 w-auto" />
              <span className="text-lg font-semibold">Padlock Insurance</span>
            </div>
            <p className="text-gray-300">© 2025 Padlock Insurance. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;