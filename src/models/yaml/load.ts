import yaml from 'js-yaml';
import type { AppState } from '../state/store';

export class YamlLoader {
  static fromYaml(yamlStr: string): AppState {
    try {
      const data = yaml.load(yamlStr) as any;
      
      // データの存在チェック
      if (!data || typeof data !== 'object') {
        throw new Error('無効なYAMLフォーマットです');
      }

      // テーブルデータの変換
      const tableData = this.parseTable(data.テーブル);
      if (data.テーブル && !tableData) {
        throw new Error('無効なテーブルデータ形式です');
      }
      
      // UMLデータの検証
      if (!data.uml || typeof data.uml.mode !== 'string' || 
          !['editor-viewer', 'viewer-only'].includes(data.uml.mode)) {
        throw new Error('無効なUMLモード設定です');
      }

      // ビューデータの検証
      if (!data.view || typeof data.view.splitRatio !== 'number' || 
          data.view.splitRatio < 1 || data.view.splitRatio > 99) {
        throw new Error('無効な分割比率です');
      }

      // 20x20の空のテーブルを作成
      const emptyTable = Array.from({ length: 20 }, () =>
        Array.from({ length: 20 }, () => ({ value: '' }))
      );

      // テーブルデータを配置
      if (tableData) {
        for (let row = 0; row < tableData.values.length; row++) {
          for (let col = 0; col < tableData.values[row].length; col++) {
            if (tableData.startCol + col < 20 && row < 20) {
              emptyTable[row][tableData.startCol + col].value = tableData.values[row][col];
            }
          }
        }
      }

      return {
        テーブル: emptyTable,
        uml: {
          mode: data.uml.mode,
          dsl: data.uml.dsl || ''
        },
        splitRatio: data.view.splitRatio
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('YAMLの解析に失敗しました');
    }
  }

  private static parseTable(tableData: any): { startCol: number; values: string[][] } | null {
    if (!tableData || typeof tableData !== 'object') {
      return null;
    }

    // キーから列のインデックスを取得
    const colKey = Object.keys(tableData)[0];
    if (!colKey) {
      return null;
    }

    const cols = colKey.split(',');
    const startCol = cols[0].charCodeAt(0) - 65; // 'A'のコードポイントを引く

    if (startCol < 0 || startCol >= 20) {
      throw new Error('無効な列インデックスです');
    }

    const values = tableData[colKey];
    if (!Array.isArray(values) || !values.every(row => Array.isArray(row))) {
      throw new Error('無効なテーブルデータ形式です');
    }

    return {
      startCol,
      values
    };
  }
} 