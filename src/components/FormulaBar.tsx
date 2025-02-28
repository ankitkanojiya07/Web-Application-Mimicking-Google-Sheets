import React from 'react';
import { Calculator } from 'lucide-react';

interface FormulaBarProps {
  formula: string;
  onChange: (formula: string) => void;
  onApply: () => void;
  selectedCell: string | null;
}

const FormulaBar: React.FC<FormulaBarProps> = ({
  formula,
  onChange,
  onApply,
  selectedCell,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onApply();
    }
  };
  
  return (
    <div className="bg-white border-b flex items-center p-2 space-x-2">
      <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
        <Calculator className="h-4 w-4 text-gray-500 mr-1" />
        <span className="text-sm font-medium">fx</span>
      </div>
      
      <div className="flex-1 flex items-center">
        <div className="w-16 text-sm text-gray-600 font-medium">
          {selectedCell || ''}
        </div>
        
        <input
          type="text"
          className="flex-1 px-2 py-1 border rounded"
          value={formula}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter formula or value"
          disabled={!selectedCell}
        />
      </div>
    </div>
  );
};

export default FormulaBar;