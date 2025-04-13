import { describe, it, expect, beforeEach } from 'vitest';
import { TableEditor } from '../../logic/table/editor';
import type { Sheet } from '../../models/table/types';

describe('動的追加UI機能のテスト', () => {
  let testSheet: Sheet;

  beforeEach(() => {
    testSheet = TableEditor.createEmptySheet();
  });

  describe('最終行・列の入力検知', () => {
    it('最終行に入力があった場合、新しい行が追加される', () => {
      const lastRowIndex = testSheet.length - 2; // 最後から2番目の行に入力
      testSheet[lastRowIndex][0].value = 'test';

      const expandedSheet = TableEditor.expandIfNeeded(testSheet);
      expect(expandedSheet.length).toBe(Math.min(testSheet.length + 1, TableEditor.GRID_SIZE));
      expect(expandedSheet[lastRowIndex][0].value).toBe('test');
      expect(expandedSheet[expandedSheet.length - 1][0].value).toBe('');
    });

    it('最終列に入力があった場合、新しい列が追加される', () => {
      const lastColIndex = testSheet[0].length - 2; // 最後から2番目の列に入力
      testSheet[0][lastColIndex].value = 'test';

      const expandedSheet = TableEditor.expandIfNeeded(testSheet);
      expect(expandedSheet[0].length).toBe(Math.min(testSheet[0].length + 1, TableEditor.GRID_SIZE));
      expect(expandedSheet[0][lastColIndex].value).toBe('test');
      expect(expandedSheet[0][expandedSheet[0].length - 1].value).toBe('');
    });

    it('空白のみの入力では拡張されない', () => {
      const lastRowIndex = testSheet.length - 1;
      testSheet[lastRowIndex][0].value = '   ';

      const expandedSheet = TableEditor.expandIfNeeded(testSheet);
      expect(expandedSheet.length).toBe(testSheet.length);
    });
  });

  describe('新規セルのプロパティ', () => {
    it('新規行のセルが正しく初期化される', () => {
      const lastRowIndex = testSheet.length - 2; // 最後から2番目の行に入力
      testSheet[lastRowIndex][0].value = 'test';

      const expandedSheet = TableEditor.expandIfNeeded(testSheet);
      const newRow = expandedSheet[expandedSheet.length - 1];

      newRow.forEach(cell => {
        expect(cell.value).toBe('');
        expect(cell.width).toBe(TableEditor.DEFAULT_COL_WIDTH);
        expect(cell.height).toBe(TableEditor.DEFAULT_ROW_HEIGHT);
      });
    });

    it('新規列のセルが正しく初期化される', () => {
      const lastColIndex = testSheet[0].length - 2; // 最後から2番目の列に入力
      testSheet[0][lastColIndex].value = 'test';

      const expandedSheet = TableEditor.expandIfNeeded(testSheet);
      expandedSheet.forEach(row => {
        const newCell = row[row.length - 1];
        expect(newCell.value).toBe('');
        expect(newCell.width).toBe(TableEditor.DEFAULT_COL_WIDTH);
        expect(newCell.height).toBe(TableEditor.DEFAULT_ROW_HEIGHT);
      });
    });
  });

  describe('グリッドサイズの制限', () => {
    it('最大グリッドサイズを超えて拡張されない', () => {
      // グリッドを最大サイズまで拡張
      for (let i = 0; i < TableEditor.GRID_SIZE - 1; i++) {
        testSheet[testSheet.length - 1][0].value = 'test';
        testSheet = TableEditor.expandIfNeeded(testSheet);
      }

      // さらに拡張を試みる
      testSheet[testSheet.length - 1][0].value = 'test';
      const expandedSheet = TableEditor.expandIfNeeded(testSheet);

      expect(expandedSheet.length).toBe(TableEditor.GRID_SIZE);
      expect(expandedSheet[0].length).toBe(TableEditor.GRID_SIZE);
    });
  });
}); 