import { describe, it, expect } from 'vitest';
import { TableEditor } from './editor';

describe('TableEditor', () => {
  describe('正常系', () => {
    it('セル入力が正しく反映されること', () => {
      const sheet = TableEditor.createEmptySheet();
      const updatedSheet = TableEditor.updateCell(sheet, 0, 0, 'test');
      expect(updatedSheet[0][0].value).toBe('test');
    });

    it('空のシートが正しく作成されること', () => {
      const sheet = TableEditor.createEmptySheet();
      expect(sheet.length).toBe(TableEditor.GRID_SIZE);
      expect(sheet[0].length).toBe(TableEditor.GRID_SIZE);
      expect(sheet[0][0].value).toBe('');
    });

    it('動的行追加が正しく動作すること', () => {
      const sheet = TableEditor.createEmptySheet();
      const updatedSheet = TableEditor.updateCell(sheet, TableEditor.GRID_SIZE - 2, 0, 'test');

      // 自動的に行が追加されることを確認
      const expandedSheet = TableEditor.expandIfNeeded(updatedSheet);
      expect(expandedSheet.length).toBe(TableEditor.GRID_SIZE);
      expect(expandedSheet[TableEditor.GRID_SIZE - 2][0].value).toBe('test');
      expect(expandedSheet[TableEditor.GRID_SIZE - 1][0].value).toBe('');
    });

    it('動的列追加が正しく動作すること', () => {
      const sheet = TableEditor.createEmptySheet();
      const updatedSheet = TableEditor.updateCell(sheet, 0, TableEditor.GRID_SIZE - 2, 'test');

      // 自動的に列が追加されることを確認
      const expandedSheet = TableEditor.expandIfNeeded(updatedSheet);
      expect(expandedSheet[0].length).toBe(TableEditor.GRID_SIZE);
      expect(expandedSheet[0][TableEditor.GRID_SIZE - 2].value).toBe('test');
      expect(expandedSheet[0][TableEditor.GRID_SIZE - 1].value).toBe('');
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
      expect(TableEditor.getColumnWidth(maxSheet, 2)).toBe(300);
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
}); 