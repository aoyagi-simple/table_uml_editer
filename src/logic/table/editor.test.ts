import { describe, it, expect } from 'vitest';
import { TableEditor } from './editor';

describe('TableEditor', () => {
  describe('正常系', () => {
    it('セル入力が正しく反映されること', () => {
      const sheet = TableEditor.createEmptySheet();
      
      // セルを更新
      const updatedSheet = TableEditor.updateCell(sheet, 1, 2, 'test');
      
      // 更新されたセルの値を確認
      expect(TableEditor.getCellValue(updatedSheet, 1, 2)).toBe('test');
      
      // 元のシートが変更されていないことを確認
      expect(sheet[1][2].value).toBe('');
      
      // 他のセルが影響を受けていないことを確認
      expect(TableEditor.getCellValue(updatedSheet, 0, 0)).toBe('');
      expect(TableEditor.getCellValue(updatedSheet, 19, 19)).toBe('');
    });

    it('空のシートが正しく作成されること', () => {
      const sheet = TableEditor.createEmptySheet();
      
      // サイズの確認
      expect(sheet.length).toBe(20);
      expect(sheet[0].length).toBe(20);
      
      // すべてのセルが空であることを確認
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 20; col++) {
          expect(sheet[row][col].value).toBe('');
        }
      }
    });

    it('動的行追加が正しく動作すること', () => {
      const sheet = TableEditor.createEmptySheet();
      
      // 最終行にデータを入力
      const updatedSheet = TableEditor.updateCell(sheet, 19, 0, 'test');
      
      // 自動的に行が追加されることを確認
      const expandedSheet = TableEditor.expandIfNeeded(updatedSheet);
      expect(expandedSheet.length).toBe(21);
      expect(expandedSheet[19][0].value).toBe('test');
      expect(expandedSheet[20][0].value).toBe('');
    });

    it('動的列追加が正しく動作すること', () => {
      const sheet = TableEditor.createEmptySheet();
      
      // 最終列にデータを入力
      const updatedSheet = TableEditor.updateCell(sheet, 0, 19, 'test');
      
      // 自動的に列が追加されることを確認
      const expandedSheet = TableEditor.expandIfNeeded(updatedSheet);
      expect(expandedSheet[0].length).toBe(21);
      expect(expandedSheet[0][19].value).toBe('test');
      expect(expandedSheet[0][20].value).toBe('');
    });

    it('自動トリミングが正しく動作すること', () => {
      const sheet = TableEditor.createEmptySheet();
      
      // データを入力
      let updatedSheet = sheet;
      updatedSheet = TableEditor.updateCell(updatedSheet, 0, 0, 'A');
      updatedSheet = TableEditor.updateCell(updatedSheet, 1, 1, 'B');
      updatedSheet = TableEditor.updateCell(updatedSheet, 2, 2, 'C');
      
      // トリミング実行
      const trimmedSheet = TableEditor.trim(updatedSheet);
      
      // 使用されている範囲のみ残っていることを確認
      expect(trimmedSheet.length).toBe(3);
      expect(trimmedSheet[0].length).toBe(3);
      
      // データが保持されていることを確認
      expect(trimmedSheet[0][0].value).toBe('A');
      expect(trimmedSheet[1][1].value).toBe('B');
      expect(trimmedSheet[2][2].value).toBe('C');
    });
  });

  describe('異常系', () => {
    it('範囲外のインデックスでエラーが発生すること（更新時）', () => {
      const sheet = TableEditor.createEmptySheet();
      
      // 負のインデックス
      expect(() => TableEditor.updateCell(sheet, -1, 0, 'test')).toThrow('セルのインデックスが範囲外です');
      expect(() => TableEditor.updateCell(sheet, 0, -1, 'test')).toThrow('セルのインデックスが範囲外です');
      
      // 範囲外のインデックス
      expect(() => TableEditor.updateCell(sheet, 20, 0, 'test')).toThrow('セルのインデックスが範囲外です');
      expect(() => TableEditor.updateCell(sheet, 0, 20, 'test')).toThrow('セルのインデックスが範囲外です');
    });

    it('範囲外のインデックスでエラーが発生すること（取得時）', () => {
      const sheet = TableEditor.createEmptySheet();
      
      // 負のインデックス
      expect(() => TableEditor.getCellValue(sheet, -1, 0)).toThrow('セルのインデックスが範囲外です');
      expect(() => TableEditor.getCellValue(sheet, 0, -1)).toThrow('セルのインデックスが範囲外です');
      
      // 範囲外のインデックス
      expect(() => TableEditor.getCellValue(sheet, 20, 0)).toThrow('セルのインデックスが範囲外です');
      expect(() => TableEditor.getCellValue(sheet, 0, 20)).toThrow('セルのインデックスが範囲外です');
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
      expect(() => TableEditor.getColumnWidth(sheet, 20)).toThrow('インデックスが範囲外です');
      expect(() => TableEditor.setColumnWidth(sheet, -1, 100)).toThrow('インデックスが範囲外です');
      expect(() => TableEditor.setColumnWidth(sheet, 20, 100)).toThrow('インデックスが範囲外です');
      
      // 行高さ
      expect(() => TableEditor.getRowHeight(sheet, -1)).toThrow('インデックスが範囲外です');
      expect(() => TableEditor.getRowHeight(sheet, 20)).toThrow('インデックスが範囲外です');
      expect(() => TableEditor.setRowHeight(sheet, -1, 30)).toThrow('インデックスが範囲外です');
      expect(() => TableEditor.setRowHeight(sheet, 20, 30)).toThrow('インデックスが範囲外です');
    });
  });
}); 