import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import UmlArea from './UmlArea.svelte';
import { tableStore } from '../../models/state/store';
import { UmlViewer } from '../../logic/uml/viewer';

// UmlViewerのモック
vi.mock('../../logic/uml/viewer', () => ({
  UmlViewer: {
    initialize: vi.fn(),
    debounceRender: vi.fn(),
    clearDebounce: vi.fn()
  }
}));

describe('UmlArea', () => {
  beforeEach(() => {
    // モックのリセット
    vi.mocked(UmlViewer.initialize).mockReset();
    vi.mocked(UmlViewer.debounceRender).mockReset();
    vi.mocked(UmlViewer.clearDebounce).mockReset();
    // debounceRenderのデフォルト実装
    vi.mocked(UmlViewer.debounceRender).mockResolvedValue();
  });

  describe('正常系', () => {
    it('DSL入力・描画同期とモード切替が正しく動作すること', async () => {
      const { container } = render(UmlArea);
      
      // 初期状態の確認
      expect(container.querySelector('.editor-container')).toBeTruthy();
      expect(container.querySelector('.viewer-container')).toBeTruthy();
      expect(get(tableStore).uml.mode).toBe('editor-viewer');

      // モード切替ボタンをクリック
      const toggleButton = screen.getByText('▶');
      await fireEvent.click(toggleButton);

      // viewer-onlyモードに切り替わることを確認
      expect(container.querySelector('.editor-container')).toBeFalsy();
      expect(container.querySelector('.viewer-container')).toBeTruthy();
      expect(get(tableStore).uml.mode).toBe('viewer-only');

      // 再度クリックしてeditor-viewerモードに戻る
      await fireEvent.click(toggleButton);
      expect(container.querySelector('.editor-container')).toBeTruthy();
      expect(container.querySelector('.viewer-container')).toBeTruthy();
      expect(get(tableStore).uml.mode).toBe('editor-viewer');
    });
  });

  describe('異常系', () => {
    it('不正なDSLでエラーが表示されること', async () => {
      render(UmlArea);
      const errorMessage = 'Invalid syntax';
      vi.mocked(UmlViewer.debounceRender).mockRejectedValue(new Error(errorMessage));

      // 不正なDSLを設定
      tableStore.update(store => ({
        ...store,
        uml: {
          ...store.uml,
          dsl: 'invalid mermaid syntax'
        }
      }));

      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toHaveTextContent(`エラー: ${errorMessage}`);
      });
    });
  });
}); 