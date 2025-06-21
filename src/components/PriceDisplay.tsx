
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

  if (baseAmount === 0) {
    return (
      <div className={`${sizeClasses[size]} font-bold text-gray-900 ${className}`}>
        Free
      </div>
    );
  }

  // Always use the user's preferred currency for display
  const displayCurrency = currency?.code || baseCurrency;
  const displaySymbol = currency?.symbol || '£';
  const finalAmount = displayInfo.displayAmount;

  return (
    <div className={`${className}`}>
      <div className={`${sizeClasses[size]} font-bold text-gray-900 flex items-baseline gap-1`}>
        <span>
          {displaySymbol}
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
          {isStripeCurrencySupported(displayCurrency) ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              Billed in {displayCurrency}
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
