import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import Slider from './Slider.svelte';
import { tableStore } from '../../models/state/store';

describe('Slider', () => {
  beforeEach(() => {
    // ストアを初期状態にリセット
    tableStore.reset();
  });

  describe('正常系', () => {
    it('比率が正しく変更されること', async () => {
      const { container } = render(Slider);
      const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
      
      // 初期値の確認
      expect(slider.value).toBe('50');
      expect(get(tableStore).splitRatio).toBe(50);

      // スライダーを30%に変更
      await fireEvent.input(slider, { target: { value: '30' } });
      expect(get(tableStore).splitRatio).toBe(30);

      // スライダーを70%に変更
      await fireEvent.input(slider, { target: { value: '70' } });
      expect(get(tableStore).splitRatio).toBe(70);
    });
  });

  describe('異常系', () => {
    it('極端値が適切に補正されること', async () => {
      const { container } = render(Slider);
      const slider = container.querySelector('input[type="range"]') as HTMLInputElement;

      // 最小値未満を1に補正
      await fireEvent.input(slider, { target: { value: '0' } });
      expect(get(tableStore).splitRatio).toBe(1);

      // 最大値超過を99に補正
      await fireEvent.input(slider, { target: { value: '100' } });
      expect(get(tableStore).splitRatio).toBe(99);
    });
  });
}); 