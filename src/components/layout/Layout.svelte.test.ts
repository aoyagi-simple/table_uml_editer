/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import Layout from './Layout.svelte';
import { tableStore } from '../../models/state/store';

describe('Layout', () => {
  beforeEach(() => {
    // ストアを初期状態にリセット
    tableStore.reset();
  });

  describe('正常系', () => {
    it('エリア配置と操作連携が正しく動作すること', async () => {
      const { container } = render(Layout);
      
      const splitter = container.querySelector('.splitter') as HTMLDivElement;
      const splitterContainer = container.querySelector('.splitter-container') as HTMLDivElement;
      // 各エリアが存在することを確認
      expect(container.querySelector('.table-area')).toBeTruthy();
      expect(container.querySelector('.uml-area')).toBeTruthy();
      expect(container.querySelector('.splitter-container')).toBeTruthy();
      expect(container.querySelector('.buttons')).toBeTruthy();

      // スライダーの操作で分割比率が変更されることを確認
      
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
      // const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
      // await fireEvent.input(slider, { target: { value: '30' } });
      // expect(get(tableStore).splitRatio).toBe(30);

      // コンテンツのスタイルが更新されることを確認
      const content = container.querySelector('.content') as HTMLElement;
      expect(content.style.getPropertyValue('--split-ratio')).toBe('30%');
    });
  });

  describe('異常系', () => {
    it('リサイズで崩れないための要素が正しく設定されていること', () => {
      const { container } = render(Layout);
      
      // レイアウトの基本構造を確認
      const layout = container.querySelector('.layout');
      expect(layout).toBeTruthy();

      // コンテンツの構造を確認
      const content = container.querySelector('.content');
      expect(content).toBeTruthy();

      // エリアの存在を確認
      const tableArea = container.querySelector('.table-area');
      const umlArea = container.querySelector('.uml-area');
      expect(tableArea).toBeTruthy();
      expect(umlArea).toBeTruthy();

      // 分割比率の初期値を確認
      expect(content?.getAttribute('style')).toContain('--split-ratio: 50%');

      // 子要素の構造を確認
      expect(content?.children.length).toBe(2);
      expect(content?.children[0].classList.contains('table-area')).toBe(true);
      expect(content?.children[1].classList.contains('uml-area')).toBe(true);
    });
  });
}); 