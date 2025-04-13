export type Cell = {
  value: string;
  width?: number;   // 列幅（ピクセル）
  height?: number;  // 行高さ（ピクセル）
  isAnimating?: boolean;
};

export type Sheet = Cell[][];

export type TrimmedTable = {
  rowCount: number;
  columnCount: number;
  getValue: (row: number, col: number) => string;
};

export class TableModel {
  private sheet: Sheet;
  private colWidths: number[];
  private rowHeights: number[];
  
  // 定数定義
  private static readonly DEFAULT_COL_WIDTH = 100;  // デフォルト列幅
  private static readonly DEFAULT_ROW_HEIGHT = 24;  // デフォルト行高さ
  private static readonly MIN_COL_WIDTH = 50;      // 最小列幅
  private static readonly MAX_COL_WIDTH = 300;     // 最大列幅
  private static readonly MIN_ROW_HEIGHT = 20;     // 最小行高さ
  private static readonly MAX_ROW_HEIGHT = 100;    // 最大行高さ
  private static readonly GRID_SIZE = 20;          // グリッドサイズ
  
  constructor() {
    // 20x20のグリッドを初期化
    this.sheet = Array(TableModel.GRID_SIZE).fill(null).map(() => 
      Array(TableModel.GRID_SIZE).fill(null).map(() => ({ value: '' }))
    );
    
    // 列幅と行高さの初期化
    this.colWidths = Array(TableModel.GRID_SIZE).fill(TableModel.DEFAULT_COL_WIDTH);
    this.rowHeights = Array(TableModel.GRID_SIZE).fill(TableModel.DEFAULT_ROW_HEIGHT);
  }

  getValue(row: number, col: number): string {
    this.validatePosition(row, col);
    return this.sheet[row][col].value;
  }

  setValue(row: number, col: number, value: string): void {
    this.validatePosition(row, col);
    this.sheet[row][col].value = value;
  }

  getColumnWidth(col: number): number {
    this.validateIndex(col);
    return this.colWidths[col];
  }

  setColumnWidth(col: number, width: number): void {
    this.validateIndex(col);
    this.colWidths[col] = this.clampColumnWidth(width);
  }

  getRowHeight(row: number): number {
    this.validateIndex(row);
    return this.rowHeights[row];
  }

  setRowHeight(row: number, height: number): void {
    this.validateIndex(row);
    this.rowHeights[row] = this.clampRowHeight(height);
  }

  isEmptyRow(row: number): boolean {
    this.validateIndex(row);
    return this.sheet[row].every(cell => cell.value === '');
  }

  isEmptyColumn(col: number): boolean {
    this.validateIndex(col);
    return this.sheet.every(row => row[col].value === '');
  }

  trim(): TrimmedTable {
    // 使用されている最大の行と列を検出
    let maxRow = -1;
    let maxCol = -1;

    for (let row = 0; row < TableModel.GRID_SIZE; row++) {
      for (let col = 0; col < TableModel.GRID_SIZE; col++) {
        if (this.sheet[row][col].value !== '') {
          maxRow = Math.max(maxRow, row);
          maxCol = Math.max(maxCol, col);
        }
      }
    }

    // データがない場合は最小サイズを返す
    if (maxRow === -1 || maxCol === -1) {
      return {
        rowCount: 1,
        columnCount: 1,
        getValue: (row: number, col: number) => ''
      };
    }

    // トリミングされたデータを含むテーブルを返す
    const rowCount = maxRow + 1;
    const columnCount = maxCol + 1;
    const trimmedSheet = this.sheet.slice(0, rowCount).map(row => row.slice(0, columnCount));

    return {
      rowCount,
      columnCount,
      getValue: (row: number, col: number) => {
        if (row < 0 || row >= rowCount || col < 0 || col >= columnCount) {
          throw new Error('位置が範囲外です');
        }
        return trimmedSheet[row][col].value;
      }
    };
  }

  private validatePosition(row: number, col: number): void {
    if (row < 0 || col < 0 ) {
      throw new Error(`位置が範囲外です: (${row}, ${col})`);
    }
  }

  private validateIndex(index: number): void {
    if (index < 0 ) {
      throw new Error('インデックスが範囲外です');
    }
  }

  private clampColumnWidth(width: number): number {
    return Math.min(Math.max(width, TableModel.MIN_COL_WIDTH), TableModel.MAX_COL_WIDTH);
  }

  private clampRowHeight(height: number): number {
    return Math.min(Math.max(height, TableModel.MIN_ROW_HEIGHT), TableModel.MAX_ROW_HEIGHT);
  }
} 