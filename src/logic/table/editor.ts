import type { Sheet } from '../../models/table/types';

export class TableEditor {
  static readonly GRID_SIZE = 20;
  static readonly DEFAULT_COL_WIDTH = 100;  // デフォルト列幅
  static readonly DEFAULT_ROW_HEIGHT = 24;  // デフォルト行高さ
  static readonly MIN_COL_WIDTH = 50;      // 最小列幅
  static readonly MAX_COL_WIDTH = 2000;     // 最大列幅
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
    if (row >= sheet.length || col >= sheet[0].length) {
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
    return row >= 0 && col >= 0;
  }

  /**
   * セルの値を取得する
   * @param sheet シート
   * @param row 行インデックス
   * @param col 列インデックス
   * @returns セルの値
   * @throws 範囲外のインデックスの場合
   */
  static getCellValue(sheet: Sheet, row: number, col: number): string {
    if (!this.isValidPosition(row, col)) {
      throw new Error('セルのインデックスが範囲外です');
    }
    if (row >= sheet.length || col >= sheet[0].length) {
      throw new Error('セルのインデックスが範囲外です');
    }

    return sheet[row][col].value;
  }

  /**
   * 空のシートを作成する
   * @returns 1x1の空のシート
   */
  static createEmptySheet(): Sheet {
    return Array.from({ length: this.GRID_SIZE }, (_, row) =>
      Array.from({ length: this.GRID_SIZE }, (_, col) => ({
        value: '',
        width: this.DEFAULT_COL_WIDTH,
        height: this.DEFAULT_ROW_HEIGHT
      })))
  };

  /**
   * 必要に応じてシートを拡張する
   * @param sheet 現在のシート
   * @param options 拡張オプション
   * @returns 拡張されたシート（必要な場合）
   */
  static expandIfNeeded(sheet: Sheet, options?: { isLastRowVisible?: boolean; isLastColumnVisible?: boolean }): Sheet {
    const lastRowIndex = sheet.length - 1;
    const lastColIndex = sheet[0].length - 1;

    // 最終行・列のデータ存在チェック
    const lastRowHasData = sheet[lastRowIndex].some(cell => cell.value.trim() !== '');
    const lastColHasData = sheet.some(row => row[lastColIndex].value.trim() !== '');

    // 表示検知による拡張
    const shouldExpandRow = options?.isLastRowVisible && lastRowHasData;
    const shouldExpandCol = options?.isLastColumnVisible && lastColHasData;

    if (!shouldExpandRow && !shouldExpandCol) {
      return sheet;
    }

    // 新しいシートを作成（ディープコピー）
    const newSheet = sheet.map(row => row.map(cell => ({ ...cell })));

    // 最終行にデータがあり、表示されている場合、新しい行を追加
    if (shouldExpandRow) {
      const newRow = Array(newSheet[0].length).fill(null).map(() => ({
        value: '',
        width: this.DEFAULT_COL_WIDTH,
        height: this.DEFAULT_ROW_HEIGHT,
        isAnimating: true
      }));
      newSheet.push(newRow);
    }

    // 最終列にデータがあり、表示されている場合、各行に新しい列を追加
    if (shouldExpandCol) {
      newSheet.forEach(row => {
        row.push({
          value: '',
          width: this.DEFAULT_COL_WIDTH,
          height: this.DEFAULT_ROW_HEIGHT,
          isAnimating: true
        });
      });
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
    if (col >= sheet[0].length) {
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
    if (col >= sheet[0].length) {
      throw new Error('インデックスが範囲外です');
    }

    const clampedWidth = Math.min(Math.max(width, this.MIN_COL_WIDTH), this.MAX_COL_WIDTH);
    return sheet.map(row => row.map((cell, index) =>
      index === col ? { ...cell, width: clampedWidth } : cell
    ));
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
    if (row >= sheet.length) {
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
    if (row >= sheet.length) {
      throw new Error('インデックスが範囲外です');
    }

    const clampedHeight = Math.min(Math.max(height, this.MIN_ROW_HEIGHT), this.MAX_ROW_HEIGHT);
    const newSheet = sheet.map((r, index) =>
      index === row ? r.map(cell => ({ ...cell, height: clampedHeight })) : [...r]
    );
    return newSheet;
  }
} 