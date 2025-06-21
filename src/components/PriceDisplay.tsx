
import { useState, useEffect } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { getCurrencyDisplayInfo, isStripeCurrencySupported } from '@/services/currencyService';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface PriceDisplayProps {
  baseAmount: number;
  baseCurrency: string;
  interval?: 'month' | 'year';
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
}

const PriceDisplay = ({ 
  baseAmount, 
  baseCurrency, 
  interval = 'month',
  size = 'md',
  showBadge = true,
  className = ''
}: PriceDisplayProps) => {
  const { currency } = useCurrency();
  const [displayInfo, setDisplayInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDisplayInfo = async () => {
      if (!currency) return;
      
      setLoading(true);
      try {
        const info = await getCurrencyDisplayInfo(
          baseAmount, 
          baseCurrency, 
          currency.code
        );
        setDisplayInfo(info);
      } catch (error) {
        console.error('Failed to load currency display info:', error);
        // Fallback to base currency
        setDisplayInfo({
          displayAmount: baseAmount,
          displayCurrency: baseCurrency,
          isExact: true,
          conversionText: null
        });
      } finally {
        setLoading(false);
      }
    };

    loadDisplayInfo();
  }, [baseAmount, baseCurrency, currency]);

  if (loading || !displayInfo) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-gray-500">Loading price...</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const symbols: { [key: string]: string } = {
      GBP: '£', USD: '$', EUR: '€', CAD: 'C$', AUD: 'A$',
      GHS: '₵', NGN: '₦', INR: '₹', JPY: '¥', SGD: 'S$'
    };
    return symbols[currencyCode] || currencyCode;
  };

  if (baseAmount === 0) {
    return (
      <div className={`${sizeClasses[size]} font-bold text-gray-900 ${className}`}>
        Free
      </div>
    );
  }

  // Use the actual user's currency for display if available
  const actualDisplayCurrency = currency?.code || baseCurrency;
  const actualDisplaySymbol = getCurrencySymbol(actualDisplayCurrency);
  
  // For currencies like GHS, show the converted amount in the user's currency
  let finalAmount = displayInfo.displayAmount;
  if (currency && currency.code !== baseCurrency) {
    // If we have a specific price for this currency, use it
    finalAmount = displayInfo.displayAmount;
  }

  return (
    <div className={`${className}`}>
      <div className={`${sizeClasses[size]} font-bold text-gray-900 flex items-baseline gap-1`}>
        <span>
          {actualDisplaySymbol}
          {finalAmount.toFixed(2)}
        </span>
        <span className="text-base font-normal text-gray-600">
          /{interval}
        </span>
      </div>
      
      {displayInfo.conversionText && (
        <div className="text-sm text-gray-500 mt-1">
          {displayInfo.conversionText}
        </div>
      )}
      
      {showBadge && (
        <div className="flex items-center gap-2 mt-2">
          {isStripeCurrencySupported(actualDisplayCurrency) ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              Billed in {actualDisplayCurrency}
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              Billed in GBP
            </Badge>
          )}
          {!displayInfo.isExact && (
            <Badge variant="outline" className="text-xs">
              Estimated
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;
