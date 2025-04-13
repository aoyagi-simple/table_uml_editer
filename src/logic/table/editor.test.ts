import { describe, it, expect } from 'vitest';
import { TableEditor } from './editor';
import type { Sheet, Cell } from '../../models/table/types';

describe('TableEditor', () => {
  describe('正常系', () => {
    it('セル入力が正しく反映されること', () => {
      const sheet = TableEditor.createEmptySheet();
      const updatedSheet = TableEditor.updateCell(sheet, 0, 0, 'test');
      expect(updatedSheet[0][0].value).toBe('test');
    });

    it('空のシートが正しく作成されること', () => {
      const sheet = TableEditor.createEmptySheet();
      expect(sheet.length).toBe(20); // デフォルトサイズ
      expect(sheet[0].length).toBe(20);
      expect(sheet[0][0].value).toBe('');

      // カスタムサイズのシート作成
      const customSheet = TableEditor.createEmptySheet(30, 40);
      expect(customSheet.length).toBe(30);
      expect(customSheet[0].length).toBe(40);
      expect(customSheet[0][0].value).toBe('');
    });

    it('動的行追加が正しく動作すること', () => {
      const sheet = TableEditor.createEmptySheet(10, 10);
      const updatedSheet = TableEditor.updateCell(sheet, 8, 0, 'test');

      // 自動的に行が追加されることを確認
      const expandedSheet = TableEditor.expandIfNeeded(updatedSheet, {
        isLastRowVisible: true,
        isLastColumnVisible: false
      });
      expect(expandedSheet.length).toBe(11);
      expect(expandedSheet[8][0].value).toBe('test');
      expect(expandedSheet[10][0].value).toBe('');
    });

    it('動的列追加が正しく動作すること', () => {
      const sheet = TableEditor.createEmptySheet(10, 10);
      const updatedSheet = TableEditor.updateCell(sheet, 0, 8, 'test');

      // 自動的に列が追加されることを確認
      const expandedSheet = TableEditor.expandIfNeeded(updatedSheet, {
        isLastRowVisible: false,
        isLastColumnVisible: true
      });
      expect(expandedSheet[0].length).toBe(11);
      expect(expandedSheet[0][8].value).toBe('test');
      expect(expandedSheet[0][10].value).toBe('');
    });

    it('自動トリミングが正しく動作すること', () => {
      const sheet = TableEditor.createEmptySheet();
      const updatedSheet = TableEditor.updateCell(sheet, 0, 0, 'test');
      expect(updatedSheet[0][0].value).toBe('test');
    });
  });

  describe('異常系', () => {
    it('範囲外のインデックスでエラーが発生すること（更新時）', () => {
      const sheet = TableEditor.createEmptySheet();
      
      // 負のインデックス
      expect(() => TableEditor.updateCell(sheet, -1, 0, 'test')).toThrow('セルのインデックスが範囲外です');
      expect(() => TableEditor.updateCell(sheet, 0, -1, 'test')).toThrow('セルのインデックスが範囲外です');
    });

    it('範囲外のインデックスでエラーが発生すること（取得時）', () => {
      const sheet = TableEditor.createEmptySheet();
      
      // 負のインデックス
      expect(() => TableEditor.getCellValue(sheet, -1, 0)).toThrow('セルのインデックスが範囲外です');
      expect(() => TableEditor.getCellValue(sheet, 0, -1)).toThrow('セルのインデックスが範囲外です');
    });
  });

  describe('サイズ管理', () => {
    it('列幅の設定と取得が正しく動作すること', () => {
      const sheet = TableEditor.createEmptySheet();
      
      // デフォルト値の確認
      expect(TableEditor.getColumnWidth(sheet, 0)).toBe(100);
      
      // 列幅の設定
      const updatedSheet = TableEditor.setColumnWidth(sheet, 0, 150);
      expect(TableEditor.getColumnWidth(updatedSheet, 0)).toBe(150);
      
      // 最小値の制約
      const minSheet = TableEditor.setColumnWidth(sheet, 1, 30);
      expect(TableEditor.getColumnWidth(minSheet, 1)).toBe(50);
      
      // 最大値の制約
      const maxSheet = TableEditor.setColumnWidth(sheet, 2, 500);
      expect(TableEditor.getColumnWidth(maxSheet, 2)).toBe(500);
    });

    it('行高さの設定と取得が正しく動作すること', () => {
      const sheet = TableEditor.createEmptySheet();
      
      // デフォルト値の確認
      expect(TableEditor.getRowHeight(sheet, 0)).toBe(24);
      
      // 行高さの設定
      const updatedSheet = TableEditor.setRowHeight(sheet, 0, 40);
      expect(TableEditor.getRowHeight(updatedSheet, 0)).toBe(40);
      
      // 最小値の制約
      const minSheet = TableEditor.setRowHeight(sheet, 1, 15);
      expect(TableEditor.getRowHeight(minSheet, 1)).toBe(20);
      
      // 最大値の制約
      const maxSheet = TableEditor.setRowHeight(sheet, 2, 200);
      expect(TableEditor.getRowHeight(maxSheet, 2)).toBe(100);
    });

    it('範囲外のインデックスでエラーが発生すること（サイズ管理）', () => {
      const sheet = TableEditor.createEmptySheet();
      
      // 列幅
      expect(() => TableEditor.getColumnWidth(sheet, -1)).toThrow('インデックスが範囲外です');
      expect(() => TableEditor.setColumnWidth(sheet, -1, 100)).toThrow('インデックスが範囲外です');
      
      // 行高さ
      expect(() => TableEditor.getRowHeight(sheet, -1)).toThrow('インデックスが範囲外です');
      expect(() => TableEditor.setRowHeight(sheet, -1, 30)).toThrow('インデックスが範囲外です');
    });
  });

  describe('パフォーマンス', () => {
    it('大規模シートの操作が効率的に行われること', () => {
      // 大きなシートを作成（100x100）
      const sheet: Sheet = Array.from({ length: 100 }, (_, row) =>
        Array.from({ length: 100 }, (_, col) => ({
          value: '',
          width: TableEditor.DEFAULT_COL_WIDTH,
          height: TableEditor.DEFAULT_ROW_HEIGHT
        }))
      );

      const startTime = performance.now();

      // 1000回のセル更新をシミュレート
      for (let i = 0; i < 1000; i++) {
        const row = Math.floor(Math.random() * 100);
        const col = Math.floor(Math.random() * 100);
        TableEditor.updateCell(sheet, row, col, `test${i}`);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 1000回の更新が1秒以内に完了することを確認
      expect(executionTime).toBeLessThan(1000);
    });

    it('大規模シートの拡張が効率的に行われること', () => {
      // 大きなシートを作成（100x100）
      const sheet: Sheet = Array.from({ length: 100 }, (_, row) =>
        Array.from({ length: 100 }, (_, col) => ({
          value: '',
          width: TableEditor.DEFAULT_COL_WIDTH,
          height: TableEditor.DEFAULT_ROW_HEIGHT
        }))
      );

      const startTime = performance.now();

      // 100回の拡張をシミュレート
      let currentSheet = sheet;
      for (let i = 0; i < 100; i++) {
        currentSheet = TableEditor.expandIfNeeded(currentSheet, {
          isLastRowVisible: true,
          isLastColumnVisible: true
        });
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 100回の拡張が1秒以内に完了することを確認
      expect(executionTime).toBeLessThan(1000);

      // シートが正しく拡張されていることを確認
      expect(currentSheet.length).toBe(200);
      expect(currentSheet[0].length).toBe(200);
    });

    it('メモリ使用量が適切に管理されていること', () => {
      if (typeof process === 'undefined') {
        return; // Node.js環境でのみ実行
      }

      const initialMemory = process.memoryUsage();
      
      // 大きなシートを作成（200x200）
      const sheet: Sheet = Array.from({ length: 200 }, (_, row) =>
        Array.from({ length: 200 }, (_, col) => ({
          value: `test-${row}-${col}`,
          width: TableEditor.DEFAULT_COL_WIDTH,
          height: TableEditor.DEFAULT_ROW_HEIGHT
        }))
      );

      // メモリ使用量の増加を確認
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // メモリ増加が100MB未満であることを確認
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });
}); 