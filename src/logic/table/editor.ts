import type { Sheet } from '../../models/table/types';

export class TableEditor {
  private static readonly GRID_SIZE = 20;
  private static readonly DEFAULT_COL_WIDTH = 100;  // デフォルト列幅
  private static readonly DEFAULT_ROW_HEIGHT = 24;  // デフォルト行高さ
  private static readonly MIN_COL_WIDTH = 50;      // 最小列幅
  private static readonly MAX_COL_WIDTH = 300;     // 最大列幅
  private static readonly MIN_ROW_HEIGHT = 20;     // 最小行高さ
  private static readonly MAX_ROW_HEIGHT = 100;    // 最大行高さ

  /**
   * セルの値を更新する
   * @param sheet 現在のシート
   * @param row 行インデックス
   * @param col 列インデックス
   * @param value 新しい値
   * @returns 更新されたシート
   */
  static updateCell(sheet: Sheet, row: number, col: number, value: string): Sheet {
    if (!this.isValidPosition(row, col)) {
      throw new Error('セルのインデックスが範囲外です');
    }

    const newSheet = sheet.map(row => [...row]);
    newSheet[row][col] = { value };
    return newSheet;
  }

  /**
   * セルの位置が有効かどうかを検証する
   * @param row 行インデックス
   * @param col 列インデックス
   * @returns 有効な場合はtrue
   */
  static isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.GRID_SIZE && col >= 0 && col < this.GRID_SIZE;
  }

  /**
   * セルの値を取得する
   * @param sheet シート
   * @param row 行インデックス（0-19）
   * @param col 列インデックス（0-19）
   * @returns セルの値
   * @throws 範囲外のインデックスの場合
   */
  static getCellValue(sheet: Sheet, row: number, col: number): string {
    // 範囲チェック
    if (row < 0 || row >= this.GRID_SIZE || col < 0 || col >= this.GRID_SIZE) {
      throw new Error('セルのインデックスが範囲外です');
    }

    return sheet[row][col].value;
  }

  /**
   * 空のシートを作成する
   * @returns 20x20の空のシート
   */
  static createEmptySheet(): Sheet {
    return Array.from({ length: this.GRID_SIZE }, (_, row) =>
      Array.from({ length: this.GRID_SIZE }, (_, col) => ({
        value: '',
        width: this.DEFAULT_COL_WIDTH,
        height: this.DEFAULT_ROW_HEIGHT
      }))
    );
  }

  /**
   * 必要に応じてシートを拡張する
   * @param sheet 現在のシート
   * @returns 拡張されたシート（必要な場合）
   */
  static expandIfNeeded(sheet: Sheet): Sheet {
    const lastRowHasData = sheet[sheet.length - 1].some(cell => cell.value !== '');
    const lastColHasData = sheet.some(row => row[row.length - 1].value !== '');

    if (!lastRowHasData && !lastColHasData) {
      return sheet;
    }

    // 新しいシートを作成
    const newSheet = sheet.map(row => [...row]);

    // 最終行にデータがある場合、新しい行を追加
    if (lastRowHasData) {
      newSheet.push(Array(sheet[0].length).fill(null).map(() => ({ value: '' })));
    }

    // 最終列にデータがある場合、各行に新しい列を追加
    if (lastColHasData) {
      newSheet.forEach(row => row.push({ value: '' }));
    }

    return newSheet;
  }

  /**
   * シートをトリミングする
   * @param sheet 現在のシート
   * @returns トリミングされたシート
   */
  static trim(sheet: Sheet): Sheet {
    // 使用されている最大の行と列を検出
    let maxRow = -1;
    let maxCol = -1;

    for (let row = 0; row < sheet.length; row++) {
      for (let col = 0; col < sheet[row].length; col++) {
        if (sheet[row][col].value !== '') {
          maxRow = Math.max(maxRow, row);
          maxCol = Math.max(maxCol, col);
        }
      }
    }

    // データがない場合は1x1のシートを返す
    if (maxRow === -1 || maxCol === -1) {
      return [[{ value: '' }]];
    }

    // トリミングされたシートを作成
    return sheet
      .slice(0, maxRow + 1)
      .map(row => row.slice(0, maxCol + 1));
  }

  /**
   * 列幅を取得する
   * @param sheet シート
   * @param col 列インデックス
   * @returns 列幅（ピクセル）
   */
  static getColumnWidth(sheet: Sheet, col: number): number {
    if (!this.isValidPosition(0, col)) {
      throw new Error('インデックスが範囲外です');
    }
    return sheet[0][col].width ?? this.DEFAULT_COL_WIDTH;
  }

  /**
   * 列幅を設定する
   * @param sheet シート
   * @param col 列インデックス
   * @param width 新しい幅（ピクセル）
   * @returns 更新されたシート
   */
  static setColumnWidth(sheet: Sheet, col: number, width: number): Sheet {
    if (!this.isValidPosition(0, col)) {
      throw new Error('インデックスが範囲外です');
    }

    const clampedWidth = Math.min(Math.max(width, this.MIN_COL_WIDTH), this.MAX_COL_WIDTH);
    const newSheet = sheet.map(row => row.map((cell, index) => 
      index === col ? { ...cell, width: clampedWidth } : { ...cell }
    ));
    return newSheet;
  }

  /**
   * 行高さを取得する
   * @param sheet シート
   * @param row 行インデックス
   * @returns 行高さ（ピクセル）
   */
  static getRowHeight(sheet: Sheet, row: number): number {
    if (!this.isValidPosition(row, 0)) {
      throw new Error('インデックスが範囲外です');
    }
    return sheet[row][0].height ?? this.DEFAULT_ROW_HEIGHT;
  }

  /**
   * 行高さを設定する
   * @param sheet シート
   * @param row 行インデックス
   * @param height 新しい高さ（ピクセル）
   * @returns 更新されたシート
   */
  static setRowHeight(sheet: Sheet, row: number, height: number): Sheet {
    if (!this.isValidPosition(row, 0)) {
      throw new Error('インデックスが範囲外です');
    }

    const clampedHeight = Math.min(Math.max(height, this.MIN_ROW_HEIGHT), this.MAX_ROW_HEIGHT);
    const newSheet = sheet.map((r, index) => 
      index === row ? r.map(cell => ({ ...cell, height: clampedHeight })) : [...r]
    );
    return newSheet;
  }
} 