
import { useState } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin } from 'lucide-react';
import { getCurrencyByCountry } from '@/services/currencyService';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CurrencySelectorProps {
  showCard?: boolean;
  compact?: boolean;
  minimal?: boolean;
}

// Clean list of 5 supported currencies
const currencies = [
  { code: 'GBP', symbol: '£', label: 'British Pound (£)', country: 'United Kingdom', countryCode: 'GB' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)', country: 'United States', countryCode: 'US' },
  { code: 'CAD', symbol: 'CAD', label: 'Canadian Dollar (CAD)', country: 'Canada', countryCode: 'CA' },
  { code: 'AUD', symbol: 'AUD', label: 'Australian Dollar (AUD)', country: 'Australia', countryCode: 'AU' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)', country: 'European Union', countryCode: 'DE' }
];

const CurrencySelector = ({ showCard = true, compact = false, minimal = false }: CurrencySelectorProps) => {
  const { userCountry, currency, updateUserCountry, loading, autoDetected } = useCurrency();
  const [updating, setUpdating] = useState(false);

  const handleCurrencyChange = async (countryCode: string) => {
    if (updating || loading) return;
    setUpdating(true);
    try {
      await updateUserCountry(countryCode);
      const newCurrency = getCurrencyByCountry(countryCode);
      toast({
        title: "Currency Updated",
        description: `Prices will now be shown in ${newCurrency.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update currency preference",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Get current selected currency
  const selectedCurrency = currencies.find(c => c.countryCode === userCountry) || currencies[0];

  if (minimal) {
    return (
      <Select
        value={userCountry || 'GB'}
        onValueChange={handleCurrencyChange}
        disabled={updating || loading}
      >
        <SelectTrigger className="w-[80px] h-8 bg-white/90 border-white/30 text-gray-900 font-semibold">
          <SelectValue>
            {selectedCurrency.symbol}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {currencies.map((curr) => (
            <SelectItem key={curr.code} value={curr.countryCode}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{curr.symbol}</span>
                <span className="text-sm">{curr.code}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Globe className="h-4 w-4 text-gray-500" />
        <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 p-1">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleCurrencyChange(curr.countryCode)}
              disabled={updating || loading}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                currency?.code === curr.code
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{curr.symbol}</span>
                <span className="text-xs">{curr.code}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold">Select Your Currency</h3>
            <p className="text-sm text-gray-600">
              {currency ? `Currently: ${currency.name} (${currency.code})` : 'Loading...'}
            </p>
          </div>
        </div>
        {autoDetected && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <MapPin className="h-3 w-3 mr-1" />
            Auto-detected
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* Currency Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {currencies.map((curr) => (
            <Button
              key={curr.code}
              variant={currency?.code === curr.code ? "default" : "outline"}
              onClick={() => handleCurrencyChange(curr.countryCode)}
              disabled={updating || loading}
              className={`h-auto py-4 px-4 flex flex-col items-center justify-center gap-2 transition-all ${
                currency?.code === curr.code
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  : 'hover:bg-gray-50 hover:border-blue-300'
              }`}
            >
              <span className="text-3xl font-medium">{curr.symbol}</span>
              <div className="text-center">
                <div className="font-semibold text-sm">{curr.code}</div>
                <div className="text-xs opacity-80 mt-0.5">{curr.country}</div>
              </div>
            </Button>
          ))}
        </div>

        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
          <p>• All currencies are supported for billing with Stripe</p>
          <p>• Your location is auto-detected but you can change it anytime</p>
        </div>
      </div>
    </>
  );

  if (!showCard) {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Currency Preferences</CardTitle>
        <CardDescription>
          Choose your preferred currency for pricing display
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default CurrencySelector;
