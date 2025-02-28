import { SpreadsheetData, CellValue } from '../types';
import { 
  getCellData, 
  parseRangeString, 
  isValidCellReference, 
  isValidRangeReference,
  getCellValueAsNumber
} from './cellUtils';

// Parse arguments for a function
const parseArguments = (argsString: string): string[] => {
  const args: string[] = [];
  let currentArg = '';
  let inQuotes = false;
  let parenCount = 0;
  
  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];
    
    if (char === '"' && argsString[i - 1] !== '\\') {
      inQuotes = !inQuotes;
      currentArg += char;
    } else if (char === '(' && !inQuotes) {
      parenCount++;
      currentArg += char;
    } else if (char === ')' && !inQuotes) {
      parenCount--;
      currentArg += char;
    } else if (char === ',' && !inQuotes && parenCount === 0) {
      args.push(currentArg.trim());
      currentArg = '';
    } else {
      currentArg += char;
    }
  }
  
  if (currentArg.trim()) {
    args.push(currentArg.trim());
  }
  
  return args;
};

// Get values from a range of cells
const getValuesFromRange = (range: string[], data: SpreadsheetData): CellValue[] => {
  return range.map(cellRef => {
    const cellData = getCellData(data, cellRef);
    return cellData.value;
  });
};

// Get numeric values from a range of cells (filtering out non-numbers)
const getNumericValuesFromRange = (range: string[], data: SpreadsheetData): number[] => {
  return range
    .map(cellRef => {
      const cellData = getCellData(data, cellRef);
      return getCellValueAsNumber(cellData.value);
    })
    .filter((value): value is number => value !== null);
};

// Evaluate a function
const evaluateFunction = (functionName: string, args: string[], data: SpreadsheetData): CellValue => {
  switch (functionName.toUpperCase()) {
    case 'SUM':
      return evaluateSumFunction(args, data);
    case 'AVERAGE':
      return evaluateAverageFunction(args, data);
    case 'MAX':
      return evaluateMaxFunction(args, data);
    case 'MIN':
      return evaluateMinFunction(args, data);
    case 'COUNT':
      return evaluateCountFunction(args, data);
    case 'TRIM':
      return evaluateTrimFunction(args, data);
    case 'UPPER':
      return evaluateUpperFunction(args, data);
    case 'LOWER':
      return evaluateLowerFunction(args, data);
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
};

// SUM function
const evaluateSumFunction = (args: string[], data: SpreadsheetData): number => {
  let sum = 0;
  
  for (const arg of args) {
    if (isValidRangeReference(arg)) {
      const range = parseRangeString(arg);
      const values = getNumericValuesFromRange(range, data);
      sum += values.reduce((acc, val) => acc + val, 0);
    } else if (isValidCellReference(arg)) {
      const cellData = getCellData(data, arg);
      const value = getCellValueAsNumber(cellData.value);
      if (value !== null) {
        sum += value;
      }
    } else {
      const value = parseFloat(arg);
      if (!isNaN(value)) {
        sum += value;
      }
    }
  }
  
  return sum;
};

// AVERAGE function
const evaluateAverageFunction = (args: string[], data: SpreadsheetData): number => {
  let sum = 0;
  let count = 0;
  
  for (const arg of args) {
    if (isValidRangeReference(arg)) {
      const range = parseRangeString(arg);
      const values = getNumericValuesFromRange(range, data);
      sum += values.reduce((acc, val) => acc + val, 0);
      count += values.length;
    } else if (isValidCellReference(arg)) {
      const cellData = getCellData(data, arg);
      const value = getCellValueAsNumber(cellData.value);
      if (value !== null) {
        sum += value;
        count++;
      }
    } else {
      const value = parseFloat(arg);
      if (!isNaN(value)) {
        sum += value;
        count++;
      }
    }
  }
  
  return count > 0 ? sum / count : 0;
};

// MAX function
const evaluateMaxFunction = (args: string[], data: SpreadsheetData): number | null => {
  let max: number | null = null;
  
  for (const arg of args) {
    if (isValidRangeReference(arg)) {
      const range = parseRangeString(arg);
      const values = getNumericValuesFromRange(range, data);
      
      if (values.length > 0) {
        const rangeMax = Math.max(...values);
        max = max === null ? rangeMax : Math.max(max, rangeMax);
      }
    } else if (isValidCellReference(arg)) {
      const cellData = getCellData(data, arg);
      const value = getCellValueAsNumber(cellData.value);
      
      if (value !== null) {
        max = max === null ? value : Math.max(max, value);
      }
    } else {
      const value = parseFloat(arg);
      if (!isNaN(value)) {
        max = max === null ? value : Math.max(max, value);
      }
    }
  }
  
  return max;
};

// MIN function
const evaluateMinFunction = (args: string[], data: SpreadsheetData): number | null => {
  let min: number | null = null;
  
  for (const arg of args) {
    if (isValidRangeReference(arg)) {
      const range = parseRangeString(arg);
      const values = getNumericValuesFromRange(range, data);
      
      if (values.length > 0) {
        const rangeMin = Math.min(...values);
        min = min === null ? rangeMin : Math.min(min, rangeMin);
      }
    } else if (isValidCellReference(arg)) {
      const cellData = getCellData(data, arg);
      const value = getCellValueAsNumber(cellData.value);
      
      if (value !== null) {
        min = min === null ? value : Math.min(min, value);
      }
    } else {
      const value = parseFloat(arg);
      if (!isNaN(value)) {
        min = min === null ? value : Math.min(min, value);
      }
    }
  }
  
  return min;
};

// COUNT function
const evaluateCountFunction = (args: string[], data: SpreadsheetData): number => {
  let count = 0;
  
  for (const arg of args) {
    if (isValidRangeReference(arg)) {
      const range = parseRangeString(arg);
      const values = getNumericValuesFromRange(range, data);
      count += values.length;
    } else if (isValidCellReference(arg)) {
      const cellData = getCellData(data, arg);
      const value = getCellValueAsNumber(cellData.value);
      if (value !== null) {
        count++;
      }
    } else {
      const value = parseFloat(arg);
      if (!isNaN(value)) {
        count++;
      }
    }
  }
  
  return count;
};

// TRIM function
const evaluateTrimFunction = (args: string[], data: SpreadsheetData): string => {
  if (args.length !== 1) {
    throw new Error('TRIM function requires exactly one argument');
  }
  
  const arg = args[0];
  let text: string;
  
  if (isValidCellReference(arg)) {
    const cellData = getCellData(data, arg);
    text = String(cellData.value || '');
  } else {
    text = arg.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
  }
  
  return text.trim();
};

// UPPER function
const evaluateUpperFunction = (args: string[], data: SpreadsheetData): string => {
  if (args.length !== 1) {
    throw new Error('UPPER function requires exactly one argument');
  }
  
  const arg = args[0];
  let text: string;
  
  if (isValidCellReference(arg)) {
    const cellData = getCellData(data, arg);
    text = String(cellData.value || '');
  } else {
    text = arg.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
  }
  
  return text.toUpperCase();
};

// LOWER function
const evaluateLowerFunction = (args: string[], data: SpreadsheetData): string => {
  if (args.length !== 1) {
    throw new Error('LOWER function requires exactly one argument');
  }
  
  const arg = args[0];
  let text: string;
  
  if (isValidCellReference(arg)) {
    const cellData = getCellData(data, arg);
    text = String(cellData.value || '');
  } else {
    text = arg.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
  }
  
  return text.toLowerCase();
};

// Evaluate a formula
export const evaluateFormula = (formula: string, data: SpreadsheetData): CellValue => {
  if (!formula.startsWith('=')) {
    return formula;
  }
  
  const expression = formula.substring(1).trim();
  
  try {
    // Check for functions
    if (expression.includes('(') && expression.includes(')')) {
      const functionMatch = expression.match(/^([A-Z_]+)\((.*)\)$/);
      
      if (functionMatch) {
        const functionName = functionMatch[1];
        const args = parseArguments(functionMatch[2]);
        
        return evaluateFunction(functionName, args, data);
      }
    }
    
    // Check for cell references
    if (isValidCellReference(expression)) {
      const cellData = getCellData(data, expression);
      return cellData.value;
    }
    
    // Simple arithmetic expressions (not implemented in this basic version)
    throw new Error('Complex expressions not supported yet');
  } catch (error) {
    return `#ERROR: ${(error as Error).message}`;
  }
};

// Find and replace text in a range of cells
export const findAndReplace = (
  data: SpreadsheetData,
  range: string[],
  findText: string,
  replaceText: string
): SpreadsheetData => {
  let updatedData = { ...data };
  
  for (const cellRef of range) {
    const cellData = getCellData(data, cellRef);
    
    if (cellData.value !== null && typeof cellData.value === 'string') {
      const newValue = cellData.value.replace(new RegExp(findText, 'g'), replaceText);
      
      if (newValue !== cellData.value) {
        updatedData = setCellData(updatedData, cellRef, {
          value: newValue,
          formatted: newValue,
        });
      }
    }
  }
  
  return updatedData;
};

// Remove duplicate rows in a range
export const removeDuplicates = (
  data: SpreadsheetData,
  startCell: string,
  endCell: string
): { data: SpreadsheetData; removedCount: number } => {
  const { row: startRow, col: startCol } = parseCellReference(startCell);
  const { row: endRow, col: endCol } = parseCellReference(endCell);
  
  // Get all rows in the range
  const rows: { [key: number]: string[] } = {};
  
  for (let row = startRow; row <= endRow; row++) {
    rows[row] = [];
    
    for (let col = startCol; col <= endCol; col++) {
      const cellRef = getCellReference(row, col);
      const cellData = getCellData(data, cellRef);
      rows[row].push(String(cellData.value || ''));
    }
  }
  
  // Find duplicate rows
  const uniqueRows = new Set<string>();
  const duplicateRows: number[] = [];
  
  for (let row = startRow; row <= endRow; row++) {
    const rowString = JSON.stringify(rows[row]);
    
    if (uniqueRows.has(rowString)) {
      duplicateRows.push(row);
    } else {
      uniqueRows.add(rowString);
    }
  }
  
  // Remove duplicate rows (in a real implementation, this would be more complex)
  let updatedData = { ...data };
  
  // This is a simplified version - in a real implementation, we would need to
  // shift all cells up to remove the duplicates
  for (const row of duplicateRows) {
    for (let col = startCol; col <= endCol; col++) {
      const cellRef = getCellReference(row, col);
      updatedData = setCellData(updatedData, cellRef, {
        value: null,
        formula: '',
        formatted: '',
      });
    }
  }
  
  return { data: updatedData, removedCount: duplicateRows.length };
};

// Helper function to set cell data (imported from cellUtils but redefined here for completeness)
const setCellData = (
  data: SpreadsheetData,
  cellRef: string,
  cellData: Partial<CellData>
): SpreadsheetData => {
  const existingCell = getCellData(data, cellRef);
  
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