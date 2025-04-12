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
  });

  // 異常系テスト
  describe('異常系', () => {
    it('範囲外アクセスでエラーが発生すること', () => {
      const table = new TableModel();
      
      // 負の値でテスト
      expect(() => table.getValue(-1, 0)).toThrow('位置が範囲外です');
      expect(() => table.setValue(0, -1, 'test')).toThrow('位置が範囲外です');
      
      // 範囲を超える値でテスト
      expect(() => table.getValue(20, 0)).toThrow('位置が範囲外です');
      expect(() => table.setValue(0, 20, 'test')).toThrow('位置が範囲外です');
    });
  });
}); 