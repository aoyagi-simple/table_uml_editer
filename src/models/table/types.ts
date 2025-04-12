export type Cell = {
  value: string;
};

export type Sheet = Cell[][];

export class TableModel {
  private sheet: Sheet;
  
  constructor() {
    // 20x20のグリッドを初期化
    this.sheet = Array(20).fill(null).map(() => 
      Array(20).fill(null).map(() => ({ value: '' }))
    );
  }

  getValue(row: number, col: number): string {
    this.validatePosition(row, col);
    return this.sheet[row][col].value;
  }

  setValue(row: number, col: number, value: string): void {
    this.validatePosition(row, col);
    this.sheet[row][col].value = value;
  }

  private validatePosition(row: number, col: number): void {
    if (row < 0 || row >= 20 || col < 0 || col >= 20) {
      throw new Error(`位置が範囲外です: (${row}, ${col})`);
    }
  }
} 