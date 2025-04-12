import { describe, it, expect } from 'vitest';
import { SplitSlider } from './slider';

describe('SplitSlider', () => {
  describe('正常系', () => {
    it('比率更新が正しく動作すること', () => {
      // 有効な範囲内の値
      expect(SplitSlider.updateRatio(50)).toBe(50);
      
      // 小数点の丸め処理
      expect(SplitSlider.updateRatio(50.4)).toBe(50);
      expect(SplitSlider.updateRatio(50.6)).toBe(51);
    });

    it('境界値が正しく処理されること', () => {
      // 最小値
      expect(SplitSlider.updateRatio(1)).toBe(1);
      expect(SplitSlider.validateRatio(1)).toBe(true);
      
      // 最大値
      expect(SplitSlider.updateRatio(99)).toBe(99);
      expect(SplitSlider.validateRatio(99)).toBe(true);
    });
  });

  describe('異常系', () => {
    it('範囲外の値が正しく補正されること', () => {
      // 最小値未満
      expect(SplitSlider.updateRatio(0)).toBe(1);
      expect(SplitSlider.updateRatio(-10)).toBe(1);
      
      // 最大値超過
      expect(SplitSlider.updateRatio(100)).toBe(99);
      expect(SplitSlider.updateRatio(150)).toBe(99);
    });

    it('範囲外の値が無効と判定されること', () => {
      // 最小値未満
      expect(SplitSlider.validateRatio(0)).toBe(false);
      expect(SplitSlider.validateRatio(-10)).toBe(false);
      
      // 最大値超過
      expect(SplitSlider.validateRatio(100)).toBe(false);
      expect(SplitSlider.validateRatio(150)).toBe(false);
    });
  });
}); 