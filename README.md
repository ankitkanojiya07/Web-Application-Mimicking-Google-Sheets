# Google Sheets Clone

A web application that mimics the user interface and core functionalities of Google Sheets, with a focus on mathematical and data quality functions, data entry, and key UI interactions.


## PREVIEW

![Screenshot 2025-02-28 203627](https://github.com/user-attachments/assets/43ae8921-c5ba-4a24-bd52-0f83a00e4674)
![Screenshot 2025-02-28 203733](https://github.com/user-attachments/assets/1fd783fc-0e15-433e-84e6-d4ca5ae0b01d)
![Screenshot 2025-02-28 203805](https://github.com/user-attachments/assets/a5803a45-32e9-436c-82a0-fd0c6823c07f)


## Features

### 1. Spreadsheet Interface
- Google Sheets-like UI with toolbar, formula bar, and cell structure
- Drag functionality for cell selection
- Cell dependencies with formula updates
- Support for basic cell formatting (bold, italics, font size, color)
- Add, delete, and resize rows and columns

### 2. Mathematical Functions
- SUM: Calculates the sum of a range of cells
- AVERAGE: Calculates the average of a range of cells
- MAX: Returns the maximum value from a range of cells
- MIN: Returns the minimum value from a range of cells
- COUNT: Counts the number of cells containing numerical values in a range

### 3. Data Quality Functions
- TRIM: Removes leading and trailing whitespace from a cell
- UPPER: Converts the text in a cell to uppercase
- LOWER: Converts the text in a cell to lowercase
- REMOVE_DUPLICATES: Removes duplicate rows from a selected range
- FIND_AND_REPLACE: Allows users to find and replace specific text within a range of cells

### 4. Data Entry and Validation
- Support for various data types (numbers, text)
- Basic data validation for numeric cells

### 5. Additional Features
- Save and load spreadsheets (JSON format)

## Data Structures and Tech Stack

### Tech Stack
- **React**: For building the user interface components
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: For styling the application
- **Lucide React**: For icons
- **Vite**: For fast development and building

### Data Structures

#### Core Data Model
The application uses a structured data model to represent the spreadsheet:

```typescript
interface SpreadsheetData {
  cells: { [key: string]: CellData };  // Cell data indexed by cell reference (e.g., "A1")
  rowCount: number;                    // Total number of rows
  colCount: number;                    // Total number of columns
  rowHeights: { [key: number]: number }; // Custom row heights
  colWidths: { [key: number]: number };  // Custom column widths
  selectedCell: string | null;         // Currently selected cell
  selectedRange: string[] | null;      // Currently selected range
  activeFormula: string;               // Current formula being edited
}

interface CellData {
  value: string | number | null;       // The actual value stored in the cell
  formula: string;                     // Formula used to calculate the value (if any)
  formatted: string;                   // Formatted display value
  styles: CellStyles;                  // Cell styling information
}

interface CellStyles {
  bold: boolean;
  italic: boolean;
  fontSize: number;
  color: string;
  backgroundColor: string;
}
```

#### Cell Referencing System
- Cells are referenced using a standard spreadsheet notation (e.g., "A1", "B2")
- Column indices are converted to letters (0 -> A, 1 -> B, etc.)
- Row indices are 1-based (as displayed to the user)

#### Formula Evaluation
- Formulas are parsed and evaluated using a recursive approach
- Cell dependencies are tracked to ensure updates propagate correctly
- Functions like SUM, AVERAGE, etc. operate on ranges of cells

## Why This Approach?

1. **Component-Based Architecture**: React's component model allows for clean separation of concerns and reusable UI elements.

2. **Immutable State Management**: Using React's state management with immutable updates ensures predictable behavior and makes it easier to track changes.

3. **Cell-Based Data Model**: Storing cell data in an object indexed by cell reference (e.g., "A1") provides efficient lookups and updates.

4. **Formula Evaluation System**: The formula system is designed to be extensible, making it easy to add new functions.

5. **TypeScript for Type Safety**: Using TypeScript helps catch errors at compile time and provides better tooling support.

6. **Tailwind CSS for Styling**: Tailwind provides utility classes that make it easy to create a consistent UI without writing custom CSS.

## Usage

1. **Basic Navigation**:
   - Click on cells to select them
   - Use the formula bar to enter values or formulas
   - Drag to select a range of cells

2. **Entering Formulas**:
   - Start with an equals sign (=)
   - Example: `=SUM(A1:A5)` to sum cells A1 through A5

3. **Formatting Cells**:
   - Use the toolbar to apply formatting (bold, italic, font size, color)

4. **Working with Rows and Columns**:
   - Click the row or column header to select the entire row or column
   - Use the resize handles to adjust row heights and column widths
   - Use the + buttons to add new rows or columns

5. **Data Tools**:
   - Select a range and use Find and Replace to update text
   - Select a range and use Remove Duplicates to clean data

6. **Saving and Loading**:
   - Use the Save button to download your spreadsheet as a JSON file
   - Use the Load button to upload a previously saved spreadsheet
