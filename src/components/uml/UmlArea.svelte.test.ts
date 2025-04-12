import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import UmlArea from './UmlArea.svelte';
import { tableStore } from '../../models/state/store';

describe('UmlArea', () => {
  beforeEach(() => {
    // ストアを初期状態にリセット
    tableStore.reset();
  });

  describe('正常系', () => {
    it('DSL入力・描画同期とモード切替が正しく動作すること', async () => {
      const { container } = render(UmlArea);
      
      // 初期状態の確認
      expect(container.querySelector('.editor-container')).toBeTruthy();
      expect(container.querySelector('.viewer-container')).toBeTruthy();
      expect(get(tableStore).uml.mode).toBe('editor-viewer');

      // モード切替ボタンをクリック
      const toggleButton = container.querySelector('.mode-toggle');
      await fireEvent.click(toggleButton!);

      // viewer-onlyモードに切り替わることを確認
      expect(container.querySelector('.editor-container')).toBeFalsy();
      expect(container.querySelector('.viewer-container')).toBeTruthy();
      expect(get(tableStore).uml.mode).toBe('viewer-only');

      // もう一度クリックしてeditor-viewerモードに戻る
      await fireEvent.click(toggleButton!);
      expect(container.querySelector('.editor-container')).toBeTruthy();
      expect(container.querySelector('.viewer-container')).toBeTruthy();
      expect(get(tableStore).uml.mode).toBe('editor-viewer');
    });
  });

  describe('異常系', () => {
    it('不正なDSLでエラーが表示されること', async () => {
      const { container } = render(UmlArea);
      
      // 不正なDSLを設定
      tableStore.update(store => ({
        ...store,
        uml: {
          ...store.uml,
          dsl: 'invalid mermaid syntax'
        }
      }));

      // エラーメッセージが表示されることを確認
      const errorElement = await screen.findByText(/Mermaid.*error/i);
      expect(errorElement).toBeTruthy();
    });
  });
}); 