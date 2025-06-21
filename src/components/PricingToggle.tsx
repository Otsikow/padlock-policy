
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

const PricingToggle = ({ isAnnual, onToggle }: PricingToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <span className={`text-sm ${!isAnnual ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>Monthly</span>
      <Switch
        checked={isAnnual}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-blue-600"
      />
      <span className={`text-sm ${isAnnual ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
        Annual 
        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">2 months free</Badge>
      </span>
    </div>
  );
};

export default PricingToggle;
