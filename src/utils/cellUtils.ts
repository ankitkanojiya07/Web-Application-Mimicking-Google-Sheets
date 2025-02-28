import { CellData, CellValue, SpreadsheetData } from '../types';

// Convert column index to letter (0 -> A, 1 -> B, etc.)
export const indexToColumn = (index: number): string => {
  let column = '';
  let temp = index;
  
  while (temp >= 0) {
    column = String.fromCharCode(65 + (temp % 26)) + column;
    temp = Math.floor(temp / 26) - 1;
  }
  
  return column;
};

// Convert column letter to index (A -> 0, B -> 1, etc.)
export const columnToIndex = (column: string): number => {
  let result = 0;
  
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 64);
  }
  
  return result - 1;
};

// Get cell reference (e.g., "A1")
export const getCellReference = (row: number, col: number): string => {
  return `${indexToColumn(col)}${row + 1}`;
};

// Parse cell reference (e.g., "A1" -> { row: 0, col: 0 })
export const parseCellReference = (ref: string): { row: number; col: number } => {
  const match = ref.match(/([A-Z]+)(\d+)/);
  if (!match) {
    throw new Error(`Invalid cell reference: ${ref}`);
  }
  
  const col = columnToIndex(match[1]);
  const row = parseInt(match[2], 10) - 1;
  
  return { row, col };
};

// Get default cell data
export const getDefaultCellData = (): CellData => ({
  value: null,
  formula: '',
  formatted: '',
  styles: {
    bold: false,
    italic: false,
    fontSize: 12,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
});

// Get cell data from spreadsheet
export const getCellData = (data: SpreadsheetData, cellRef: string): CellData => {
  return data.cells[cellRef] || getDefaultCellData();
};

// Set cell data in spreadsheet
export const setCellData = (
  data: SpreadsheetData,
  cellRef: string,
  cellData: Partial<CellData>
): SpreadsheetData => {
  const existingCell = data.cells[cellRef] || getDefaultCellData();
  
  return {
    ...data,
    cells: {
      ...data.cells,
      [cellRef]: {
        ...existingCell,
        ...cellData,
      },
    },
  };
};

// Get range of cells (e.g., "A1:B3")
export const getCellRange = (start: string, end: string): string[] => {
  const startCell = parseCellReference(start);
  const endCell = parseCellReference(end);
  
  const startRow = Math.min(startCell.row, endCell.row);
  const endRow = Math.max(startCell.row, endCell.row);
  const startCol = Math.min(startCell.col, endCell.col);
  const endCol = Math.max(startCell.col, endCell.col);
  
  const range: string[] = [];
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      range.push(getCellReference(row, col));
    }
  }
  
  return range;
};

// Parse a range string (e.g., "A1:B3")
export const parseRangeString = (rangeStr: string): string[] => {
  const parts = rangeStr.split(':');
  if (parts.length !== 2) {
    throw new Error(`Invalid range: ${rangeStr}`);
  }
  
  return getCellRange(parts[0], parts[1]);
};

// Check if a string is a valid cell reference
export const isValidCellReference = (ref: string): boolean => {
  return /^[A-Z]+\d+$/.test(ref);
};

// Check if a string is a valid range reference
export const isValidRangeReference = (ref: string): boolean => {
  return /^[A-Z]+\d+:[A-Z]+\d+$/.test(ref);
};

// Get cell value as number (or null if not a number)
export const getCellValueAsNumber = (value: CellValue): number | null => {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }
  
  return null;
};