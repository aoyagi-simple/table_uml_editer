import { describe, it, expect, beforeEach } from 'vitest';
import { TableEditor } from '../../logic/table/editor';
import type { Sheet } from '../../models/table/types';

describe('動的追加UI機能のテスト', () => {
  let testSheet: Sheet;

  beforeEach(() => {
    testSheet = TableEditor.createEmptySheet();
  });

  describe('最終行・列の表示検知', () => {
    it('最終行が表示され、データがある場合、新しい行が追加される', () => {
      // 最終行にデータを設定
      testSheet[testSheet.length - 1][0].value = 'test';
      
      const expandedSheet = TableEditor.expandIfNeeded(testSheet, { isLastRowVisible: true });
      expect(expandedSheet.length).toBe(testSheet.length + 1);
      expect(expandedSheet[expandedSheet.length - 1].every(cell => cell.value === '')).toBe(true);
    });

    it('最終列が表示され、データがある場合、新しい列が追加される', () => {
      // 最終列にデータを設定
      testSheet[0][testSheet[0].length - 1].value = 'test';
      
      const expandedSheet = TableEditor.expandIfNeeded(testSheet, { isLastColumnVisible: true });
      expect(expandedSheet[0].length).toBe(testSheet[0].length + 1);
      expect(expandedSheet.every(row => row[row.length - 1].value === '')).toBe(true);
    });

    it('最終行・列が表示されていない場合は拡張されない', () => {
      // 最終行と列にデータを設定
      testSheet[testSheet.length - 1][0].value = 'test';
      testSheet[0][testSheet[0].length - 1].value = 'test';
      
      const expandedSheet = TableEditor.expandIfNeeded(testSheet, { 
        isLastRowVisible: false, 
        isLastColumnVisible: false 
      });
      
      expect(expandedSheet.length).toBe(testSheet.length);
      expect(expandedSheet[0].length).toBe(testSheet[0].length);
    });

    it('最終行・列にデータがない場合は拡張されない', () => {
      const expandedSheet = TableEditor.expandIfNeeded(testSheet, { 
        isLastRowVisible: true, 
        isLastColumnVisible: true 
      });
      
      expect(expandedSheet.length).toBe(testSheet.length);
      expect(expandedSheet[0].length).toBe(testSheet[0].length);
    });
  });

  describe('新規セルのプロパティ', () => {
    it('新規行のセルが正しく初期化される', () => {
      // 最終行にデータを設定
      testSheet[testSheet.length - 1][0].value = 'test';
      
      const expandedSheet = TableEditor.expandIfNeeded(testSheet, { isLastRowVisible: true });
      const newRow = expandedSheet[expandedSheet.length - 1];

      newRow.forEach(cell => {
        expect(cell.value).toBe('');
        expect(cell.width).toBe(TableEditor.DEFAULT_COL_WIDTH);
        expect(cell.height).toBe(TableEditor.DEFAULT_ROW_HEIGHT);
        expect(cell.isAnimating).toBe(true);
      });
    });

    it('新規列のセルが正しく初期化される', () => {
      // 最終列にデータを設定
      testSheet[0][testSheet[0].length - 1].value = 'test';
      
      const expandedSheet = TableEditor.expandIfNeeded(testSheet, { isLastColumnVisible: true });
      expandedSheet.forEach(row => {
        const newCell = row[row.length - 1];
        expect(newCell.value).toBe('');
        expect(newCell.width).toBe(TableEditor.DEFAULT_COL_WIDTH);
        expect(newCell.height).toBe(TableEditor.DEFAULT_ROW_HEIGHT);
        expect(newCell.isAnimating).toBe(true);
      });
    });
  });

  describe('連続拡張', () => {
    it('複数回の拡張が可能である', () => {
      let currentSheet = testSheet;
      
      // 最終行と列にデータを設定して3回拡張
      for (let i = 0; i < 3; i++) {
        currentSheet[currentSheet.length - 1][0].value = 'test';
        currentSheet[0][currentSheet[0].length - 1].value = 'test';
        currentSheet = TableEditor.expandIfNeeded(currentSheet, { 
          isLastRowVisible: true,
          isLastColumnVisible: true 
        });
      }

      expect(currentSheet.length).toBe(testSheet.length + 3);
      expect(currentSheet[0].length).toBe(testSheet[0].length + 3);
    });
  });
}); 