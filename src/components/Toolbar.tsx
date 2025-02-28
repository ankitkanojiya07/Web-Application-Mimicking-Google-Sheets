import React from 'react';
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Search,
  Trash,
  ChevronDown,
  FileText,
  BarChart,
  Calculator,
  Sigma,
  Percent,
  Hash,
  Type,
  Palette,
} from 'lucide-react';

interface ToolbarProps {
  onFormat: (format: { [key: string]: any }) => void;
  onFindReplace: () => void;
  onRemoveDuplicates: () => void;
  selectedCell: string | null;
  selectedRange: string[] | null;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onFindReplace,
  onRemoveDuplicates,
  selectedCell,
  selectedRange,
}) => {
  const isDisabled = !selectedCell;
  
  return (
    <div className="bg-white border-b flex items-center p-1 space-x-1">
      {/* Font formatting */}
      <div className="border-r pr-1 flex items-center space-x-1">
        <button
          className={`p-1 rounded ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          onClick={() => !isDisabled && onFormat({ bold: true })}
          disabled={isDisabled}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        
        <button
          className={`p-1 rounded ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          onClick={() => !isDisabled && onFormat({ italic: true })}
          disabled={isDisabled}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        
        <div className="relative group">
          <button
            className={`p-1 rounded flex items-center ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            disabled={isDisabled}
            title="Font Size"
          >
            <Type className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 ml-1" />
          </button>
          
          <div className="absolute left-0 top-full mt-1 bg-white border rounded shadow-lg z-10 hidden group-hover:block">
            {[8, 9, 10, 11, 12, 14, 16, 18, 24, 36].map((size) => (
              <button
                key={size}
                className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                onClick={() => !isDisabled && onFormat({ fontSize: size })}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative group">
          <button
            className={`p-1 rounded flex items-center ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            disabled={isDisabled}
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 ml-1" />
          </button>
          
          <div className="absolute left-0 top-full mt-1 bg-white border rounded shadow-lg z-10 hidden group-hover:block p-2">
            <div className="grid grid-cols-5 gap-1">
              {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FF9900', '#9900FF', '#009900'].map((color) => (
                <button
                  key={color}
                  className="w-5 h-5 rounded-sm border"
                  style={{ backgroundColor: color }}
                  onClick={() => !isDisabled && onFormat({ color })}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Alignment */}
      <div className="border-r pr-1 flex items-center space-x-1">
        <button
          className={`p-1 rounded ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          disabled={isDisabled}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        
        <button
          className={`p-1 rounded ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          disabled={isDisabled}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        
        <button
          className={`p-1 rounded ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          disabled={isDisabled}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Functions */}
      <div className="border-r pr-1 flex items-center space-x-1">
        <div className="relative group">
          <button
            className="p-1 rounded flex items-center hover:bg-gray-100"
            title="Functions"
          >
            <Sigma className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 ml-1" />
          </button>
          
          <div className="absolute left-0 top-full mt-1 bg-white border rounded shadow-lg z-10 hidden group-hover:block w-48">
            <div className="p-2 border-b text-xs font-semibold text-gray-500">MATHEMATICAL</div>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">
              SUM(range)
            </button>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">
              AVERAGE(range)
            </button>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">
              MAX(range)
            </button>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">
              MIN(range)
            </button>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">
              COUNT(range)
            </button>
            
            <div className="p-2 border-b border-t text-xs font-semibold text-gray-500">DATA QUALITY</div>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">
              TRIM(text)
            </button>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">
              UPPER(text)
            </button>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">
              LOWER(text)
            </button>
          </div>
        </div>
      </div>
      
      {/* Data tools */}
      <div className="flex items-center space-x-1">
        <button
          className={`p-1 rounded ${!selectedRange ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          onClick={onFindReplace}
          disabled={!selectedRange}
          title="Find and Replace"
        >
          <Search className="h-4 w-4" />
        </button>
        
        <button
          className={`p-1 rounded ${!selectedRange ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          onClick={onRemoveDuplicates}
          disabled={!selectedRange}
          title="Remove Duplicates"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;