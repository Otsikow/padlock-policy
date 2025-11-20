import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Filter, X, Star } from 'lucide-react';
import { MarketplaceFilters as Filters, POLICY_TYPES, UK_REGIONS, COMMON_BENEFITS } from '@/types/marketplace';
import { useCurrency } from '@/hooks/useCurrency';

interface MarketplaceFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
}

const MarketplaceFilters = ({ filters, onFiltersChange, onReset }: MarketplaceFiltersProps) => {
  const { formatAmount } = useCurrency();
  const [isExpanded, setIsExpanded] = useState(true);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleBenefit = (benefit: string) => {
    const currentBenefits = filters.extra_benefits || [];
    const newBenefits = currentBenefits.includes(benefit)
      ? currentBenefits.filter(b => b !== benefit)
      : [...currentBenefits, benefit];
    updateFilter('extra_benefits', newBenefits.length > 0 ? newBenefits : undefined);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== null).length;

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            disabled={activeFilterCount === 0}
          >
            Reset All
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Insurance Type */}
          <div className="space-y-2">
            <Label htmlFor="policy-type" className="text-sm font-medium">
              Insurance Type
            </Label>
            <Select
              value={filters.policy_type || 'all'}
              onValueChange={(value) => updateFilter('policy_type', value === 'all' ? undefined : value as any)}
            >
              <SelectTrigger id="policy-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {POLICY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Monthly Premium Range: {filters.min_premium ? formatAmount(filters.min_premium) : '£0'} - {filters.max_premium ? formatAmount(filters.max_premium) : '£1000+'}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="min-premium" className="text-xs text-gray-600">Min</Label>
                <Input
                  id="min-premium"
                  type="number"
                  placeholder="0"
                  value={filters.min_premium || ''}
                  onChange={(e) => updateFilter('min_premium', e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="max-premium" className="text-xs text-gray-600">Max</Label>
                <Input
                  id="max-premium"
                  type="number"
                  placeholder="1000"
                  value={filters.max_premium || ''}
                  onChange={(e) => updateFilter('max_premium', e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Coverage Amount */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Coverage Amount: {filters.min_coverage ? formatAmount(filters.min_coverage) : '£0'} - {filters.max_coverage ? formatAmount(filters.max_coverage) : 'Unlimited'}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="min-coverage" className="text-xs text-gray-600">Min</Label>
                <Input
                  id="min-coverage"
                  type="number"
                  placeholder="0"
                  value={filters.min_coverage || ''}
                  onChange={(e) => updateFilter('min_coverage', e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="max-coverage" className="text-xs text-gray-600">Max</Label>
                <Input
                  id="max-coverage"
                  type="number"
                  placeholder="1000000"
                  value={filters.max_coverage || ''}
                  onChange={(e) => updateFilter('max_coverage', e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Region */}
          <div className="space-y-2">
            <Label htmlFor="region" className="text-sm font-medium">
              Region
            </Label>
            <Select
              value={filters.region || 'all'}
              onValueChange={(value) => updateFilter('region', value === 'all' ? undefined : value)}
            >
              <SelectTrigger id="region">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {UK_REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium">
              Your Age
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              value={filters.age || ''}
              onChange={(e) => updateFilter('age', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          {/* Company Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              Minimum Company Rating: {filters.min_rating || 0} / 5
            </Label>
            <Slider
              value={[filters.min_rating || 0]}
              onValueChange={([value]) => updateFilter('min_rating', value > 0 ? value : undefined)}
              min={0}
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Quick Filters */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium">Quick Filters</Label>

            <div className="flex items-center justify-between">
              <Label htmlFor="instant-issue" className="text-sm">
                Instant Issue Only
              </Label>
              <Switch
                id="instant-issue"
                checked={filters.instant_issue_only || false}
                onCheckedChange={(checked) => updateFilter('instant_issue_only', checked || undefined)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="pre-existing" className="text-sm">
                Covers Pre-existing Conditions
              </Label>
              <Switch
                id="pre-existing"
                checked={filters.covers_pre_existing || false}
                onCheckedChange={(checked) => updateFilter('covers_pre_existing', checked || undefined)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="high-risk" className="text-sm">
                Covers High-Risk Jobs
              </Label>
              <Switch
                id="high-risk"
                checked={filters.covers_high_risk_jobs || false}
                onCheckedChange={(checked) => updateFilter('covers_high_risk_jobs', checked || undefined)}
              />
            </div>
          </div>

          {/* Extra Benefits */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium">Extra Benefits</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_BENEFITS.map((benefit) => {
                const isSelected = (filters.extra_benefits || []).includes(benefit);
                return (
                  <Badge
                    key={benefit}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'hover:bg-purple-50 hover:border-purple-300'
                    }`}
                    onClick={() => toggleBenefit(benefit)}
                  >
                    {benefit}
                    {isSelected && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default MarketplaceFilters;
