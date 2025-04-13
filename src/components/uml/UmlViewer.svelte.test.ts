import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import UmlViewer from './UmlViewer.svelte';
import { UmlViewer as UmlViewerLogic } from '../../logic/uml/viewer';
import { tableStore } from '../../models/state/store';

// UmlViewerLogicのモック
vi.mock('../../logic/uml/viewer', () => ({
  UmlViewer: {
    initialize: vi.fn(),
    debounceRender: vi.fn(),
    clearDebounce: vi.fn()
  }
}));

describe('UmlViewer', () => {
  beforeEach(() => {
    // DOMのセットアップ
    document.body.innerHTML = '';
    // モックのリセット
    vi.mocked(UmlViewerLogic.initialize).mockReset();
    vi.mocked(UmlViewerLogic.debounceRender).mockReset();
    vi.mocked(UmlViewerLogic.clearDebounce).mockReset();
    // debounceRenderのデフォルト実装
    vi.mocked(UmlViewerLogic.debounceRender).mockResolvedValue();
    // ストアを初期状態にリセット
    tableStore.set({
      テーブル: Array(20).fill(Array(20).fill({ value: '' })),
      uml: {
        mode: 'editor-viewer',
        dsl: ''
      },
      splitRatio: 50
    });
  });

  afterEach(() => {
    UmlViewerLogic.clearDebounce();
  });

  describe('正常系', () => {
    it('コンポーネントがマウントされたときにMermaidが初期化されること', () => {
      render(UmlViewer);
      expect(UmlViewerLogic.initialize).toHaveBeenCalledTimes(1);
    });

    it('DSLが変更されたときにレンダリングが実行されること', async () => {
      render(UmlViewer);
      const dsl = 'graph TD;\nA-->B;';
      
      // DSLを更新
      tableStore.update(store => ({
        ...store,
        uml: {
          ...store.uml,
          dsl
        }
      }));

      // レンダリングが呼ばれたことを確認
      await waitFor(() => {
        expect(UmlViewerLogic.debounceRender).toHaveBeenCalledWith('mermaid-container', dsl);
      });
    });
  });

  describe('異常系', () => {
    it('レンダリングエラー時にエラーメッセージが表示されること', async () => {
      const errorMessage = 'Invalid syntax';
      vi.mocked(UmlViewerLogic.debounceRender).mockRejectedValue(new Error(errorMessage));

      render(UmlViewer);
      
      // 不正なDSLを設定
      tableStore.update(store => ({
        ...store,
        uml: {
          ...store.uml,
          dsl: 'invalid'
        }
      }));

      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement.textContent).toBe(`エラー: ${errorMessage}`);
      });
    });

    it('空のDSLの場合、コンテナがクリアされること', () => {
      render(UmlViewer);
      
      // 空のDSLを設定
      tableStore.update(store => ({
        ...store,
        uml: {
          ...store.uml,
          dsl: ''
        }
      }));

      const container = document.getElementById('mermaid-container');
      expect(container?.innerHTML).toBe('');
    });
  });
}); 