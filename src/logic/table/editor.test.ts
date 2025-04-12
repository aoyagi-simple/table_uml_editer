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
}); 