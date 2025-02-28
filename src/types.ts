export type CellValue = string | number | null;

export interface CellData {
  value: CellValue;
  formula: string;
  formatted: string;
  styles: CellStyles;
}

export interface CellStyles {
  bold: boolean;
  italic: boolean;
  fontSize: number;
  color: string;
  backgroundColor: string;
}

export interface SpreadsheetData {
  cells: { [key: string]: CellData };
  rowCount: number;
  colCount: number;
  rowHeights: { [key: number]: number };
  colWidths: { [key: number]: number };
  selectedCell: string | null;
  selectedRange: string[] | null;
  activeFormula: string;
}