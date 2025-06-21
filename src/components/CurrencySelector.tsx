
import { useState } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, MapPin, RefreshCw } from 'lucide-react';
import { getAllSupportedCurrencies, isStripeCurrencySupported, getCurrencyByCountry } from '@/services/currencyService';
import { toast } from '@/hooks/use-toast';

interface CurrencySelectorProps {
  showCard?: boolean;
  compact?: boolean;
}

const CurrencySelector = ({ showCard = true, compact = false }: CurrencySelectorProps) => {
  const { userCountry, currency, updateUserCountry, loading, autoDetected, refreshCountry } = useCurrency();
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const supportedCurrencies = getAllSupportedCurrencies();

  const handleCountryChange = async (countryCode: string) => {
    setUpdating(true);
    try {
      await updateUserCountry(countryCode);
      // Get the new currency info after update
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

  const handleRefreshLocation = async () => {
    setRefreshing(true);
    try {
      await refreshCountry();
      toast({
        title: "Location Refreshed",
        description: "Currency has been updated based on your location",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to detect your location",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-gray-500" />
        <Select
          value={userCountry || 'GB'}
          onValueChange={handleCountryChange}
          disabled={updating || loading}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {supportedCurrencies.map((curr) => (
              <SelectItem key={curr.countryCode} value={curr.countryCode}>
                <div className="flex items-center gap-2">
                  <span>{curr.symbol}</span>
                  <span className="text-sm">{curr.code}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold">Currency & Region</h3>
            <p className="text-sm text-gray-600">
              {currency ? `Currently showing prices in ${currency.name} (${currency.code})` : 'Loading...'}
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
        <div className="flex items-center gap-2">
          <Select
            value={userCountry || 'GB'}
            onValueChange={handleCountryChange}
            disabled={updating || loading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select your country/region" />
            </SelectTrigger>
            <SelectContent>
              {supportedCurrencies.map((curr) => (
                <SelectItem key={curr.countryCode} value={curr.countryCode}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{curr.symbol}</span>
                      <span>{curr.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">{curr.code}</span>
                      {isStripeCurrencySupported(curr.code) && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Supported
                        </Badge>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshLocation}
            disabled={refreshing}
            className="px-3"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Prices marked "Supported" can be charged in your local currency</p>
          <p>• Other currencies show approximate conversions alongside GBP charges</p>
          <p>• Your location is auto-detected but you can override it anytime</p>
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
