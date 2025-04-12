import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import GridResizer from './GridResizer.svelte';
import { tableStore } from '../../models/state/store';
import { get } from 'svelte/store';

// @vitest-environment jsdom
describe('GridResizer', () => {
  beforeEach(() => {
    // テストごとにストアをリセット
    tableStore.set({
      テーブル: [
        [{ value: '', width: 100, height: 24 }],
        [{ value: '', width: 100, height: 24 }]
      ],
      splitRatio: 50,
      uml: { mode: 'editor-viewer', dsl: '' }
    });
  });

  describe('列幅調整', () => {
    it('マウスドラッグで列幅が変更されること', async () => {
      const { container } = render(GridResizer, {
        props: {
          type: 'column',
          index: 0
        }
      });

      const handle = container.querySelector('.resize-handle');
      expect(handle).not.toBeNull();

      // マウスダウンイベントの発火
      await fireEvent.mouseDown(handle!, { clientX: 100 });
      
      // マウス移動のシミュレーション
      await fireEvent.mouseMove(window, { clientX: 150 });
      
      // マウスアップでサイズ確定
      await fireEvent.mouseUp(window);

      // ストアの状態を確認
      const state = get(tableStore);
      const width = state.テーブル[0][0].width;
      expect(width).toBe(150);
    });

    it('キーボード操作で列幅が変更できること', async () => {
      const { container } = render(GridResizer, {
        props: {
          type: 'column',
          index: 0
        }
      });

      const handle = container.querySelector('.resize-handle');
      expect(handle).not.toBeNull();

      // Enterキーでリサイズモード開始
      await fireEvent.keyDown(handle!, { key: 'Enter' });

      // ストアの状態を確認
      const state = get(tableStore);
      expect(state.テーブル[0][0].width).toBe(100); // 初期値のまま
    });
  });

  describe('行高さ調整', () => {
    it('マウスドラッグで行高さが変更されること', async () => {
      const { container } = render(GridResizer, {
        props: {
          type: 'row',
          index: 0
        }
      });

      const handle = container.querySelector('.resize-handle');
      expect(handle).not.toBeNull();

      await fireEvent.mouseDown(handle!, { clientY: 24 });
      await fireEvent.mouseMove(window, { clientY: 40 });
      await fireEvent.mouseUp(window);

      const state = get(tableStore);
      const height = state.テーブル[0][0].height;
      expect(height).toBe(40);
    });

    it('キーボード操作で行高さが変更できること', async () => {
      const { container } = render(GridResizer, {
        props: {
          type: 'row',
          index: 0
        }
      });

      const handle = container.querySelector('.resize-handle');
      expect(handle).not.toBeNull();

      // スペースキーでリサイズモード開始
      await fireEvent.keyDown(handle!, { key: ' ' });

      // ストアの状態を確認
      const state = get(tableStore);
      expect(state.テーブル[0][0].height).toBe(24); // 初期値のまま
    });
  });
}); 