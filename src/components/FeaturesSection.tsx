
import { Shield, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FeaturesSection = () => {
  const features = [{
    icon: Shield,
    title: "AI-Powered Protection",
    description: "Smart analysis of your insurance policies with instant recommendations"
  }, {
    icon: Users,
    title: "Expert Support",
    description: "24/7 access to insurance professionals and personalized guidance"
  }, {
    icon: DollarSign,
    title: "Save Money With Padlock",
    description: "Padlock compares rates from leading insurers to make sure you always get the lowest price and best value for your policy."
  }];

  return (
    <section id="features" className="section-padding bg-gradient-to-r from-white/80 to-purple-50/80 backdrop-blur-sm" aria-labelledby="features-title">
      <div className="container-responsive max-w-6xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 id="features-title" className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-purple-600" />
            Why Choose Padlock?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of insurance management with cutting-edge technology
          </p>
        </div>
        
        <div className="grid-responsive-1-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg md:text-xl font-semibold text-gray-900">
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
  );
};

export default FeaturesSection;
