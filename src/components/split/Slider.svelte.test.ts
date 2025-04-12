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
    it('マウスドラッグで比率が正しく変更されること', async () => {
      const { container } = render(Slider);
      const splitter = container.querySelector('.splitter') as HTMLDivElement;
      const splitterContainer = container.querySelector('.splitter-container') as HTMLDivElement;
      
      // 初期値の確認
      expect(get(tableStore).splitRatio).toBe(50);

      // スプリッターコンテナの位置とサイズを模擬設定
      Object.defineProperty(splitterContainer, 'getBoundingClientRect', {
        value: () => ({
          left: 0,
          width: 1000,
          // その他の必要なプロパティ
          right: 1000,
          top: 0,
          bottom: 500,
          height: 500,
          x: 0,
          y: 0,
          toJSON: () => {}
        })
      });

      // マウスダウンイベントを発火
      await fireEvent.mouseDown(splitter);
      
      // マウスムーブで30%の位置に移動
      await fireEvent.mouseMove(window, { clientX: 300 });
      expect(get(tableStore).splitRatio).toBe(30);

      // マウスムーブで70%の位置に移動
      await fireEvent.mouseMove(window, { clientX: 700 });
      expect(get(tableStore).splitRatio).toBe(70);

      // マウスアップでドラッグ終了
      await fireEvent.mouseUp(window);
    });
  });

  describe('異常系', () => {
    it('極端値が適切に補正されること', async () => {
      const { container } = render(Slider);
      const splitter = container.querySelector('.splitter') as HTMLDivElement;
      const splitterContainer = container.querySelector('.splitter-container') as HTMLDivElement;

      // スプリッターコンテナの位置とサイズを模擬設定
      Object.defineProperty(splitterContainer, 'getBoundingClientRect', {
        value: () => ({
          left: 0,
          width: 1000,
          right: 1000,
          top: 0,
          bottom: 500,
          height: 500,
          x: 0,
          y: 0,
          toJSON: () => {}
        })
      });

      // マウスダウンイベントを発火
      await fireEvent.mouseDown(splitter);

      // 最小値未満を1に補正
      await fireEvent.mouseMove(window, { clientX: -50 });
      expect(get(tableStore).splitRatio).toBe(1);

      // 最大値超過を99に補正
      await fireEvent.mouseMove(window, { clientX: 1050 });
      expect(get(tableStore).splitRatio).toBe(99);

      // マウスアップでドラッグ終了
      await fireEvent.mouseUp(window);
    });
  });
}); 