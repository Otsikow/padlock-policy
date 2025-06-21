
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DocumentTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const DocumentTypeSelector = ({ value, onChange, className = '' }: DocumentTypeSelectorProps) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const predefinedTypes = [
    { value: 'policy', label: 'Insurance Policy' },
    { value: 'receipt', label: 'Payment Receipt' },
    { value: 'id', label: 'Identification Document' },
    { value: 'claim', label: 'Claim Document' },
    { value: 'medical', label: 'Medical Record' },
    { value: 'financial', label: 'Financial Document' },
    { value: 'legal', label: 'Legal Document' },
    { value: 'other', label: 'Other' },
    { value: 'custom', label: 'Custom Type...' }
  ];

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'custom') {
      setIsCustom(true);
      onChange(customValue);
    } else {
      setIsCustom(false);
      onChange(selectedValue);
    }
  };

  const handleCustomInputChange = (inputValue: string) => {
    setCustomValue(inputValue);
    onChange(inputValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="document-type">Document Type</Label>
      {!isCustom ? (
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger id="document-type">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            {predefinedTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="Enter custom document type"
            value={customValue}
            onChange={(e) => handleCustomInputChange(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              onChange('other');
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to predefined types
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentTypeSelector;
