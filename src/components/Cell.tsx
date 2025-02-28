import React, { useState, useRef, useEffect } from 'react';
import { CellData } from '../types';

interface CellProps {
  row: number;
  col: number;
  cellData: CellData;
  isSelected: boolean;
  isInRange: boolean;
  width: number;
  height: number;
  onClick: (row: number, col: number) => void;
  onChange: (row: number, col: number, value: string) => void;
  onMouseDown: (row: number, col: number, e: React.MouseEvent) => void;
}

const Cell: React.FC<CellProps> = ({
  row,
  col,
  cellData,
  isSelected,
  isInRange,
  width,
  height,
  onClick,
  onChange,
  onMouseDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Start editing when double-clicked
  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(cellData.formula || String(cellData.value || ''));
  };
  
  // Handle click on cell
  const handleClick = () => {
    onClick(row, col);
  };
  
  // Handle mouse down for drag selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) {
      onMouseDown(row, col, e);
    }
  };
  
  // Handle key down in edit mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };
  
  // Finish editing and save changes
  const finishEditing = () => {
    setIsEditing(false);
    onChange(row, col, editValue);
  };
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  // Apply cell styles
  const cellStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    fontWeight: cellData.styles.bold ? 'bold' : 'normal',
    fontStyle: cellData.styles.italic ? 'italic' : 'normal',
    fontSize: `${cellData.styles.fontSize}px`,
    color: cellData.styles.color,
    backgroundColor: isSelected
      ? '#e8f0fe'
      : isInRange
      ? '#f1f8ff'
      : cellData.styles.backgroundColor,
    border: isSelected
      ? '2px solid #1a73e8'
      : isInRange
      ? '1px solid #c6dafc'
      : '1px solid #e2e8f0',
    padding: '0 4px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    position: 'relative',
    outline: 'none',
  };
  
  return (
    <div
      className="relative"
      style={cellStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="absolute inset-0 w-full h-full px-1 border-none outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={finishEditing}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className="w-full h-full overflow-hidden text-overflow-ellipsis">
          {cellData.formatted}
        </div>
      )}
    </div>
  );
};

export default Cell;