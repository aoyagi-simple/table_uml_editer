import yaml from 'js-yaml';
import type { AppState } from '../state/store';

export class YamlSaver {
  static toYaml(state: AppState): string {
    // 使用済みの範囲を計算
    const usedRange = this.calculateUsedRange(state.テーブル);
    
    // トリミングしたデータを作成
    const trimmedData = {
      テーブル: this.trimTable(state.テーブル, usedRange),
      uml: state.uml,
      view: {
        splitRatio: state.splitRatio,
        umlMode: state.uml.mode
      }
    };

    return yaml.dump(trimmedData, {
      indent: 2,
      lineWidth: -1, // 行の折り返しを無効化
      quotingType: "'" // 文字列を単一引用符で囲む
    });
  }

  private static calculateUsedRange(sheet: { value: string }[][]): {
    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;
  } {
    let minRow = 19, maxRow = 0, minCol = 19, maxCol = 0;
    let hasData = false;

    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 20; col++) {
        if (sheet[row][col].value !== '') {
          minRow = Math.min(minRow, row);
          maxRow = Math.max(maxRow, row);
          minCol = Math.min(minCol, col);
          maxCol = Math.max(maxCol, col);
          hasData = true;
        }
      }
    }

    // データがない場合は1x1のグリッドを返す
    if (!hasData) {
      return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 };
    }

    return { minRow, maxRow, minCol, maxCol };
  }

  private static trimTable(sheet: { value: string }[][], range: {
    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;
  }): {
    [key: string]: string[][];
  } {
    const colLabels = Array.from({ length: range.maxCol - range.minCol + 1 },
      (_, i) => String.fromCharCode(65 + range.minCol + i)).join(',');

    const rows = Array.from(
      { length: range.maxRow - range.minRow + 1 },
      (_, row) => Array.from(
        { length: range.maxCol - range.minCol + 1 },
        (_, col) => sheet[row + range.minRow][col + range.minCol].value
      )
    );

    return {
      [colLabels]: rows
    };
  }
} 