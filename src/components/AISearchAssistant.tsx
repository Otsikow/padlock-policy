import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Search, Loader2 } from 'lucide-react';
import { MarketplaceFilters, PolicyType } from '@/types/marketplace';
import { toast } from '@/hooks/use-toast';

interface AISearchAssistantProps {
  onSearch: (filters: MarketplaceFilters) => void;
}

const AISearchAssistant = ({ onSearch }: AISearchAssistantProps) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const exampleQueries = [
    'Find the cheapest car insurance for a 27-year-old in London',
    'Which travel insurance covers pre-existing medical conditions?',
    'Which company covers high-risk jobs?',
    'Show me health insurance under £200 per month',
    'Life insurance with 4+ star rating in Manchester',
  ];

  const parseNaturalLanguageQuery = (naturalQuery: string): MarketplaceFilters => {
    const filters: MarketplaceFilters = {};
    const lowerQuery = naturalQuery.toLowerCase();

    // Extract policy type
    if (lowerQuery.includes('car') || lowerQuery.includes('auto') || lowerQuery.includes('vehicle')) {
      filters.policy_type = 'auto';
    } else if (lowerQuery.includes('health') || lowerQuery.includes('medical')) {
      filters.policy_type = 'health';
    } else if (lowerQuery.includes('life')) {
      filters.policy_type = 'life';
    } else if (lowerQuery.includes('home') || lowerQuery.includes('house') || lowerQuery.includes('property')) {
      filters.policy_type = 'home';
    } else if (lowerQuery.includes('travel')) {
      filters.policy_type = 'other';
    }

    // Extract age
    const ageMatch = lowerQuery.match(/(\d{1,2})[-\s]?year[-\s]?old/);
    if (ageMatch) {
      filters.age = parseInt(ageMatch[1]);
    }

    // Extract price/premium
    const priceMatch = lowerQuery.match(/(?:under|below|less than|cheaper than|max)[£\s]*(\d+)/);
    if (priceMatch) {
      filters.max_premium = parseInt(priceMatch[1]);
    }

    const minPriceMatch = lowerQuery.match(/(?:over|above|more than|min|minimum)[£\s]*(\d+)/);
    if (minPriceMatch) {
      filters.min_premium = parseInt(minPriceMatch[1]);
    }

    // Extract cheapest/lowest
    if (lowerQuery.includes('cheapest') || lowerQuery.includes('lowest')) {
      filters.max_premium = 500; // Set a reasonable max to find affordable options
    }

    // Extract region/location
    const ukRegions = [
      'london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'edinburgh',
      'liverpool', 'bristol', 'newcastle', 'sheffield', 'cardiff', 'belfast'
    ];

    for (const region of ukRegions) {
      if (lowerQuery.includes(region)) {
        filters.region = region.charAt(0).toUpperCase() + region.slice(1);
        break;
      }
    }

    // Extract rating
    const ratingMatch = lowerQuery.match(/(\d+(?:\.\d+)?)\+?\s*star/);
    if (ratingMatch) {
      filters.min_rating = parseFloat(ratingMatch[1]);
    } else if (lowerQuery.includes('high rated') || lowerQuery.includes('top rated') || lowerQuery.includes('best rated')) {
      filters.min_rating = 4.0;
    }

    // Extract special requirements
    if (lowerQuery.includes('pre-existing') || lowerQuery.includes('pre existing') || lowerQuery.includes('medical condition')) {
      filters.covers_pre_existing = true;
    }

    if (lowerQuery.includes('high-risk') || lowerQuery.includes('high risk') || lowerQuery.includes('dangerous job')) {
      filters.covers_high_risk_jobs = true;
    }

    if (lowerQuery.includes('instant') || lowerQuery.includes('immediate') || lowerQuery.includes('quick')) {
      filters.instant_issue_only = true;
    }

    return filters;
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: 'Please enter a search query',
        description: 'Try one of the example queries below',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const parsedFilters = parseNaturalLanguageQuery(query);

      toast({
        title: 'Search interpreted',
        description: `Found ${Object.keys(parsedFilters).length} filters from your query`,
      });

      onSearch(parsedFilters);
      setIsProcessing(false);
    }, 800);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setIsProcessing(true);

    setTimeout(() => {
      const parsedFilters = parseNaturalLanguageQuery(example);
      onSearch(parsedFilters);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 border-purple-200 shadow-lg">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Search Assistant
              </h3>
              <p className="text-xs text-gray-600">Ask in plain English, we'll find what you need</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder='Try: "Find the cheapest car insurance for a 27-year-old in London"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-10 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400"
                disabled={isProcessing}
              />
              {isProcessing && (
                <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-purple-600" />
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={isProcessing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Example Queries */}
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Example queries:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-100 hover:border-purple-300 transition-all text-xs bg-white/60 backdrop-blur-sm"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISearchAssistant;
