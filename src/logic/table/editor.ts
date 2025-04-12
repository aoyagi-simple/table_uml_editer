import type { Sheet } from '../../models/table/types';

export class TableEditor {
  private static readonly GRID_SIZE = 20;

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
    if (row < 0 || row >= 20 || col < 0 || col >= 20) {
      throw new Error('セルのインデックスが範囲外です');
    }

    return sheet[row][col].value;
  }

  /**
   * 空のシートを作成する
   * @returns 20x20の空のシート
   */
  static createEmptySheet(): Sheet {
    return Array.from({ length: 20 }, () =>
      Array.from({ length: 20 }, () => ({ value: '' }))
    );
  }

  /**
   * 新しいシートを作成する
   * @returns 初期状態のシート
   */
  static createInitialSheet(): Sheet {
    return Array(this.GRID_SIZE).fill(null).map(() =>
      Array(this.GRID_SIZE).fill(null).map(() => ({ value: '' }))
    );
  }
} 