import React, { useState, useRef, useEffect } from 'react';
import { SpreadsheetData, CellData } from '../types';
import { getCellReference, getCellData, setCellData, parseCellReference } from '../utils/cellUtils';
import { evaluateFormula, findAndReplace, removeDuplicates } from '../utils/formulaUtils';
import Toolbar from './Toolbar';
import FormulaBar from './FormulaBar';
import Cell from './Cell';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Save, 
  Upload, 
  FileSpreadsheet 
} from 'lucide-react';

const DEFAULT_ROW_COUNT = 100;
const DEFAULT_COL_COUNT = 26;
const DEFAULT_ROW_HEIGHT = 25;
const DEFAULT_COL_WIDTH = 100;

const Spreadsheet: React.FC = () => {
  const [data, setData] = useState<SpreadsheetData>({
    cells: {},
    rowCount: DEFAULT_ROW_COUNT,
    colCount: DEFAULT_COL_COUNT,
    rowHeights: {},
    colWidths: {},
    selectedCell: null,
    selectedRange: null,
    activeFormula: '',
  });
  
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ row: number; col: number } | null>(null);
  
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const [resizingRow, setResizingRow] = useState<number | null>(null);
  const [startResizePos, setStartResizePos] = useState<number>(0);
  const [startSize, setStartSize] = useState<number>(0);
  
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  
  // Handle cell selection
  const handleCellClick = (row: number, col: number) => {
    const cellRef = getCellReference(row, col);
    const cellData = getCellData(data, cellRef);
    
    setData({
      ...data,
      selectedCell: cellRef,
      selectedRange: null,
      activeFormula: cellData.formula,
    });
  };
  
  // Handle cell mouse down (for drag selection)
  const handleCellMouseDown = (row: number, col: number, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left mouse button
    
    setIsDragging(true);
    setDragStart({ row, col });
    setDragEnd({ row, col });
    
    // Add event listeners for mouse move and mouse up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !spreadsheetRef.current || !dragStart) return;
    
    const rect = spreadsheetRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate row and column from mouse position
    let col = 0;
    let accumulatedWidth = 0;
    
    while (col < data.colCount) {
      const colWidth = data.colWidths[col] || DEFAULT_COL_WIDTH;
      if (accumulatedWidth + colWidth > x) break;
      accumulatedWidth += colWidth;
      col++;
    }
    
    let row = 0;
    let accumulatedHeight = 0;
    
    while (row < data.rowCount) {
      const rowHeight = data.rowHeights[row] || DEFAULT_ROW_HEIGHT;
      if (accumulatedHeight + rowHeight > y) break;
      accumulatedHeight += rowHeight;
      row++;
    }
    
    // Update drag end position
    if (col < data.colCount && row < data.rowCount) {
      setDragEnd({ row, col });
      
      // Update selected range
      const startCellRef = getCellReference(dragStart.row, dragStart.col);
      const endCellRef = getCellReference(row, col);
      
      setData({
        ...data,
        selectedCell: startCellRef,
        selectedRange: [startCellRef, endCellRef],
      });
    }
  };
  
  // Handle mouse up after drag
  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Handle cell value change
  const handleCellChange = (row: number, col: number, value: string) => {
    const cellRef = getCellReference(row, col);
    
    let cellValue: string | number | null = value;
    let formula = '';
    
    // Check if the value is a formula
    if (value.startsWith('=')) {
      formula = value;
      cellValue = evaluateFormula(value, data);
    } else if (!isNaN(Number(value)) && value.trim() !== '') {
      // Convert to number if it's numeric
      cellValue = Number(value);
    }
    
    // Update the cell data
    const updatedData = setCellData(data, cellRef, {
      value: cellValue,
      formula,
      formatted: String(cellValue),
    });
    
    setData({
      ...updatedData,
      activeFormula: formula,
    });
    
    // Update dependent cells (cells with formulas that reference this cell)
    updateDependentCells(updatedData, cellRef);
  };
  
  // Update cells that depend on the changed cell
  const updateDependentCells = (currentData: SpreadsheetData, changedCellRef: string) => {
    let updatedData = { ...currentData };
    
    // Find cells with formulas
    Object.entries(currentData.cells).forEach(([cellRef, cellData]) => {
      if (cellData.formula && cellData.formula.includes(changedCellRef)) {
        // Re-evaluate the formula
        const newValue = evaluateFormula(cellData.formula, updatedData);
        
        updatedData = setCellData(updatedData, cellRef, {
          value: newValue,
          formatted: String(newValue),
        });
        
        // Recursively update cells that depend on this cell
        updateDependentCells(updatedData, cellRef);
      }
    });
    
    setData(updatedData);
  };
  
  // Handle formula bar change
  const handleFormulaChange = (formula: string) => {
    if (!data.selectedCell) return;
    
    setData({
      ...data,
      activeFormula: formula,
    });
  };
  
  // Apply formula to selected cell
  const applyFormula = () => {
    if (!data.selectedCell) return;
    
    const { row, col } = parseCellReference(data.selectedCell);
    handleCellChange(row, col, data.activeFormula);
  };
  
  // Handle cell formatting
  const handleCellFormat = (format: { [key: string]: any }) => {
    if (!data.selectedCell) return;
    
    const cellRef = data.selectedCell;
    const cellData = getCellData(data, cellRef);
    
    const updatedData = setCellData(data, cellRef, {
      styles: {
        ...cellData.styles,
        ...format,
      },
    });
    
    setData(updatedData);
  };
  
  // Handle find and replace
  const handleFindReplace = () => {
    if (!data.selectedRange || findText === '') return;
    
    const [startCell, endCell] = data.selectedRange;
    const range = [];
    
    const { row: startRow, col: startCol } = parseCellReference(startCell);
    const { row: endRow, col: endCol } = parseCellReference(endCell);
    
    for (let row = Math.min(startRow, endRow); row <= Math.max(startRow, endRow); row++) {
      for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col++) {
        range.push(getCellReference(row, col));
      }
    }
    
    const updatedData = findAndReplace(data, range, findText, replaceText);
    setData(updatedData);
    setShowFindReplace(false);
    setFindText('');
    setReplaceText('');
  };
  
  // Handle remove duplicates
  const handleRemoveDuplicates = () => {
    if (!data.selectedRange) return;
    
    const [startCell, endCell] = data.selectedRange;
    const { data: updatedData, removedCount } = removeDuplicates(data, startCell, endCell);
    
    setData(updatedData);
    alert(`Removed ${removedCount} duplicate rows.`);
  };
  
  // Handle column resize start
  const handleColumnResizeStart = (col: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizingCol(col);
    setStartResizePos(e.clientX);
    setStartSize(data.colWidths[col] || DEFAULT_COL_WIDTH);
    
    document.addEventListener('mousemove', handleColumnResize);
    document.addEventListener('mouseup', handleColumnResizeEnd);
  };
  
  // Handle column resize
  const handleColumnResize = (e: MouseEvent) => {
    if (resizingCol === null) return;
    
    const diff = e.clientX - startResizePos;
    const newWidth = Math.max(50, startSize + diff); // Minimum width of 50px
    
    setData({
      ...data,
      colWidths: {
        ...data.colWidths,
        [resizingCol]: newWidth,
      },
    });
  };
  
  // Handle column resize end
  const handleColumnResizeEnd = () => {
    setResizingCol(null);
    document.removeEventListener('mousemove', handleColumnResize);
    document.removeEventListener('mouseup', handleColumnResizeEnd);
  };
  
  // Handle row resize start
  const handleRowResizeStart = (row: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizingRow(row);
    setStartResizePos(e.clientY);
    setStartSize(data.rowHeights[row] || DEFAULT_ROW_HEIGHT);
    
    document.addEventListener('mousemove', handleRowResize);
    document.addEventListener('mouseup', handleRowResizeEnd);
  };
  
  // Handle row resize
  const handleRowResize = (e: MouseEvent) => {
    if (resizingRow === null) return;
    
    const diff = e.clientY - startResizePos;
    const newHeight = Math.max(20, startSize + diff); // Minimum height of 20px
    
    setData({
      ...data,
      rowHeights: {
        ...data.rowHeights,
        [resizingRow]: newHeight,
      },
    });
  };
  
  // Handle row resize end
  const handleRowResizeEnd = () => {
    setResizingRow(null);
    document.removeEventListener('mousemove', handleRowResize);
    document.removeEventListener('mouseup', handleRowResizeEnd);
  };
  
  // Add a new row
  const addRow = () => {
    setData({
      ...data,
      rowCount: data.rowCount + 1,
    });
  };
  
  // Add a new column
  const addColumn = () => {
    setData({
      ...data,
      colCount: data.colCount + 1,
    });
  };
  
  // Delete selected row
  const deleteRow = () => {
    if (!data.selectedCell) return;
    
    const { row } = parseCellReference(data.selectedCell);
    
    // Create a new cells object without the cells in the deleted row
    const newCells = { ...data.cells };
    
    Object.keys(newCells).forEach(cellRef => {
      const { row: cellRow } = parseCellReference(cellRef);
      if (cellRow === row) {
        delete newCells[cellRef];
      }
    });
    
    // Shift cells below the deleted row up by one
    const shiftedCells = { ...newCells };
    
    Object.keys(newCells).forEach(cellRef => {
      const { row: cellRow, col } = parseCellReference(cellRef);
      if (cellRow > row) {
        const newRef = getCellReference(cellRow - 1, col);
        shiftedCells[newRef] = newCells[cellRef];
        delete shiftedCells[cellRef];
      }
    });
    
    setData({
      ...data,
      cells: shiftedCells,
      selectedCell: null,
      selectedRange: null,
      activeFormula: '',
    });
  };
  
  // Delete selected column
  const deleteColumn = () => {
    if (!data.selectedCell) return;
    
    const { col } = parseCellReference(data.selectedCell);
    
    // Create a new cells object without the cells in the deleted column
    const newCells = { ...data.cells };
    
    Object.keys(newCells).forEach(cellRef => {
      const { col: cellCol } = parseCellReference(cellRef);
      if (cellCol === col) {
        delete newCells[cellRef];
      }
    });
    
    // Shift cells to the right of the deleted column left by one
    const shiftedCells = { ...newCells };
    
    Object.keys(newCells).forEach(cellRef => {
      const { row, col: cellCol } = parseCellReference(cellRef);
      if (cellCol > col) {
        const newRef = getCellReference(row, cellCol - 1);
        shiftedCells[newRef] = newCells[cellRef];
        delete shiftedCells[cellRef];
      }
    });
    
    setData({
      ...data,
      cells: shiftedCells,
      selectedCell: null,
      selectedRange: null,
      activeFormula: '',
    });
  };
  
  // Save spreadsheet data
  const saveSpreadsheet = () => {
    const dataStr = JSON.stringify(data);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = 'spreadsheet.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Load spreadsheet data
  const loadSpreadsheet = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setData(json);
      } catch (error) {
        alert('Error loading file: Invalid format');
      }
    };
    
    reader.readAsText(file);
  };
  
  // Render the spreadsheet
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center bg-gray-100 p-2 border-b">
        <FileSpreadsheet className="h-6 w-6 text-green-600 mr-2" />
        <h1 className="text-lg font-semibold">Google Sheets Clone</h1>
        
        <div className="ml-auto flex space-x-2">
          <button
            className="flex items-center px-3 py-1 bg-white border rounded hover:bg-gray-50"
            onClick={saveSpreadsheet}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </button>
          
          <label className="flex items-center px-3 py-1 bg-white border rounded hover:bg-gray-50 cursor-pointer">
            <Upload className="h-4 w-4 mr-1" />
            Load
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={loadSpreadsheet}
            />
          </label>
        </div>
      </div>
      
      {/* Toolbar */}
      <Toolbar
        onFormat={handleCellFormat}
        onFindReplace={() => setShowFindReplace(true)}
        onRemoveDuplicates={handleRemoveDuplicates}
        selectedCell={data.selectedCell}
        selectedRange={data.selectedRange}
      />
      
      {/* Formula Bar */}
      <FormulaBar
        formula={data.activeFormula}
        onChange={handleFormulaChange}
        onApply={applyFormula}
        selectedCell={data.selectedCell}
      />
      
      {/* Find and Replace Dialog */}
      {showFindReplace && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 shadow-lg rounded-lg z-50 border">
          <h3 className="text-lg font-semibold mb-3">Find and Replace</h3>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Find:</label>
            <input
              type="text"
              className="w-full px-2 py-1 border rounded"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">Replace with:</label>
            <input
              type="text"
              className="w-full px-2 py-1 border rounded"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setShowFindReplace(false)}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleFindReplace}
            >
              Replace All
            </button>
          </div>
        </div>
      )}
      
      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto relative" ref={spreadsheetRef}>
        <div className="relative">
          {/* Column Headers */}
          <div className="flex sticky top-0 z-10">
            {/* Top-left corner */}
            <div className="bg-gray-200 border-b border-r flex items-center justify-center" style={{ width: '50px', height: '25px' }}>
              <button
                className="w-full h-full flex items-center justify-center hover:bg-gray-300"
                onClick={addRow}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {/* Column headers */}
            {Array.from({ length: data.colCount }).map((_, colIndex) => (
              <div
                key={`col-${colIndex}`}
                className="bg-gray-200 border-b border-r flex items-center justify-center relative"
                style={{ width: `${data.colWidths[colIndex] || DEFAULT_COL_WIDTH}px`, height: '25px' }}
              >
                <div className="flex-1 text-center text-sm font-medium">
                  {String.fromCharCode(65 + colIndex)}
                </div>
                
                {/* Column resize handle */}
                <div
                  className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleColumnResizeStart(colIndex, e)}
                ></div>
              </div>
            ))}
            
            {/* Add column button */}
            <div className="bg-gray-200 border-b border-r flex items-center justify-center" style={{ width: '25px', height: '25px' }}>
              <button
                className="w-full h-full flex items-center justify-center hover:bg-gray-300"
                onClick={addColumn}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Rows */}
          {Array.from({ length: data.rowCount }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex">
              {/* Row header */}
              <div
                className="bg-gray-200 border-b border-r flex items-center justify-center sticky left-0 z-10 relative"
                style={{ width: '50px', height: `${data.rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT}px` }}
              >
                <div className="flex-1 text-center text-sm font-medium">
                  {rowIndex + 1}
                </div>
                
                {/* Row resize handle */}
                <div
                  className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-blue-500"
                  onMouseDown={(e) => handleRowResizeStart(rowIndex, e)}
                ></div>
              </div>
              
              {/* Cells */}
              {Array.from({ length: data.colCount }).map((_, colIndex) => {
                const cellRef = getCellReference(rowIndex, colIndex);
                const cellData = getCellData(data, cellRef);
                const isSelected = data.selectedCell === cellRef;
                const isInRange = data.selectedRange && data.selectedRange.length === 2
                  ? isInSelectedRange(rowIndex, colIndex, data.selectedRange)
                  : false;
                
                return (
                  <Cell
                    key={`cell-${rowIndex}-${colIndex}`}
                    row={rowIndex}
                    col={colIndex}
                    cellData={cellData}
                    isSelected={isSelected}
                    isInRange={isInRange}
                    width={data.colWidths[colIndex] || DEFAULT_COL_WIDTH}
                    height={data.rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT}
                    onClick={handleCellClick}
                    onChange={handleCellChange}
                    onMouseDown={handleCellMouseDown}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bg-gray-100 p-2 border-t flex items-center text-sm">
        {data.selectedCell && (
          <div className="mr-4">
            Selected: {data.selectedCell}
          </div>
        )}
        
        {data.selectedRange && data.selectedRange.length === 2 && (
          <div className="mr-4">
            Range: {data.selectedRange[0]}:{data.selectedRange[1]}
          </div>
        )}
        
        <div className="ml-auto flex space-x-2">
          {data.selectedCell && (
            <>
              <button
                className="flex items-center px-2 py-1 bg-white border rounded hover:bg-gray-50"
                onClick={deleteRow}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Row
              </button>
              
              <button
                className="flex items-center px-2 py-1 bg-white border rounded hover:bg-gray-50"
                onClick={deleteColumn}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Column
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to check if a cell is in the selected range
const isInSelectedRange = (row: number, col: number, range: string[]) => {
  if (range.length !== 2) return false;
  
  const { row: startRow, col: startCol } = parseCellReference(range[0]);
  const { row: endRow, col: endCol } = parseCellReference(range[1]);
  
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);
  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);
  
  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
};

export default Spreadsheet;