
import { useCurrency } from '@/hooks/useCurrency';
import { Badge } from '@/components/ui/badge';
import { isStripeCurrencySupported } from '@/services/currencyService';

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
  const { formatAmount, currency } = useCurrency();

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

  return (
    <div className={`${className}`}>
      <div className={`${sizeClasses[size]} font-bold text-gray-900 flex items-baseline gap-1`}>
        <span>
          {formatAmount(baseAmount)}
        </span>
        <span className="text-base font-normal text-gray-600">
          /{interval}
        </span>
      </div>
      
      {showBadge && currency && (
        <div className="flex items-center gap-2 mt-2">
          {isStripeCurrencySupported(currency.code) ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              Billed in {currency.code}
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              Billed in GBP
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;
