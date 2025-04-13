import { describe, it, expect } from 'vitest';
import { TableModel } from './types';

describe('TableModel', () => {
  // 正常系テスト
  describe('正常系', () => {
    it('セル値の設定・取得が正しく動作すること', () => {
      const table = new TableModel();
      
      // 境界値でテスト
      table.setValue(0, 0, 'top-left');
      expect(table.getValue(0, 0)).toBe('top-left');
      
      table.setValue(19, 19, 'bottom-right');
      expect(table.getValue(19, 19)).toBe('bottom-right');
      
      // 中央値でテスト
      table.setValue(10, 10, 'center');
      expect(table.getValue(10, 10)).toBe('center');
    });

    it('列幅の設定・取得が正しく動作すること', () => {
      const table = new TableModel();
      
      // デフォルト値の確認
      expect(table.getColumnWidth(0)).toBe(100);
      
      // 値の設定と取得
      table.setColumnWidth(0, 150);
      expect(table.getColumnWidth(0)).toBe(150);
      
      // 最小値の制約
      table.setColumnWidth(1, 30);
      expect(table.getColumnWidth(1)).toBe(50); // 最小幅は50px
      
      // 最大値の制約
      table.setColumnWidth(2, 500);
      expect(table.getColumnWidth(2)).toBe(300); // 最大幅は300px
    });

    it('行高さの設定・取得が正しく動作すること', () => {
      const table = new TableModel();
      
      // デフォルト値の確認
      expect(table.getRowHeight(0)).toBe(24);
      
      // 値の設定と取得
      table.setRowHeight(0, 40);
      expect(table.getRowHeight(0)).toBe(40);
      
      // 最小値の制約
      table.setRowHeight(1, 15);
      expect(table.getRowHeight(1)).toBe(20); // 最小高さは20px
      
      // 最大値の制約
      table.setRowHeight(2, 200);
      expect(table.getRowHeight(2)).toBe(100); // 最大高さは100px
    });

    it('空行・空列の検出が正しく動作すること', () => {
      const table = new TableModel();
      
      // 初期状態では全行・全列が空
      expect(table.isEmptyRow(0)).toBe(true);
      expect(table.isEmptyColumn(0)).toBe(true);
      
      // データを入力すると空でなくなる
      table.setValue(0, 0, 'test');
      expect(table.isEmptyRow(0)).toBe(false);
      expect(table.isEmptyColumn(0)).toBe(false);
      
      // 一部のセルのみ入力
      table.setValue(1, 1, 'test');
      expect(table.isEmptyRow(2)).toBe(true);
      expect(table.isEmptyColumn(2)).toBe(true);
    });

    it('トリミング処理が正しく動作すること', () => {
      const table = new TableModel();
      
      // データを入力
      table.setValue(0, 0, 'A');
      table.setValue(1, 1, 'B');
      table.setValue(2, 2, 'C');
      
      // トリミング実行
      const trimmed = table.trim();
      
      // 使用されている範囲のみ残っていることを確認
      expect(trimmed.rowCount).toBe(3);
      expect(trimmed.columnCount).toBe(3);
      
      // データが保持されていることを確認
      expect(trimmed.getValue(0, 0)).toBe('A');
      expect(trimmed.getValue(1, 1)).toBe('B');
      expect(trimmed.getValue(2, 2)).toBe('C');
      
      // 元のテーブルは変更されていないことを確認
      expect(table.getValue(0, 0)).toBe('A');
      expect(table.getValue(19, 19)).toBe('');
    });
  });

  // 異常系テスト
  describe('異常系', () => {
    it('範囲外アクセスでエラーが発生すること', () => {
      const table = new TableModel();
      
      // 負の値でテスト
      expect(() => table.getValue(-1, 0)).toThrow('位置が範囲外です');
      expect(() => table.setValue(0, -1, 'test')).toThrow('位置が範囲外です');
      

      // サイズ設定の範囲外アクセス
      expect(() => table.setColumnWidth(-1, 100)).toThrow('インデックスが範囲外です');
      expect(() => table.setRowHeight(-1, 30)).toThrow('インデックスが範囲外です');
    });
  });
}); 