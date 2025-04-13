/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UmlViewer } from './viewer';
import mermaid from 'mermaid';

// mermaidのモック
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn()
  }
}));

describe('UmlViewer', () => {
  beforeEach(() => {
    // DOMのセットアップ
    document.body.innerHTML = '<div id="test-container"></div>';
    // タイマーのモック
    vi.useFakeTimers();
    // mermaidのモックをリセット
    vi.mocked(mermaid.render).mockReset();
    vi.mocked(mermaid.render).mockResolvedValue({ svg: '<svg>test</svg>', diagramType: 'flowchart' });
  });

  afterEach(() => {
    // タイマーのクリーンアップ
    vi.clearAllTimers();
    vi.useRealTimers();
    UmlViewer.clearDebounce();
  });

  describe('正常系', () => {
    it('1秒後に描画が更新されること', async () => {
      const dsl = 'graph TD;\nA-->B;';
      const svg = '<svg>test</svg>';
      vi.mocked(mermaid.render).mockResolvedValue({ svg, diagramType: 'flowchart' });

      // 描画を開始
      const renderPromise = UmlViewer.debounceRender('test-container', dsl);
      
      // タイマーを進める
      await vi.advanceTimersByTimeAsync(1000);
      await renderPromise;
      
      // 描画が呼ばれたことを確認
      expect(mermaid.render).toHaveBeenCalledTimes(1);
      expect(document.getElementById('test-container')?.innerHTML).toBe(svg);
    });

    it('空のDSLの場合、コンテナがクリアされること', async () => {
      // 空のDSLで描画
      await UmlViewer.render('test-container', '  ');
      
      expect(document.getElementById('test-container')?.innerHTML).toBe('');
    });

    it('debounceが正しく動作すること', async () => {
      const dsl = 'graph TD;\nA-->B;';
      const svg = '<svg>test</svg>';
      vi.mocked(mermaid.render).mockResolvedValue({ svg, diagramType: 'flowchart' });

      // 最初の呼び出し
      UmlViewer.debounceRender('test-container', 'first');
      
      // 500ms進める
      await vi.advanceTimersByTime(500);
      
      // 2回目の呼び出し
      UmlViewer.debounceRender('test-container', dsl);
      
      // 残りの時間を進める
      await vi.advanceTimersByTime(1000);
      
      // 最後の更新のみが反映されることを確認
      expect(mermaid.render).toHaveBeenCalledTimes(1);
      expect(mermaid.render).toHaveBeenCalledWith(expect.any(String), dsl);
    });
  });

  describe('異常系', () => {
    it('不正なDSLでエラーが表示されること', async () => {
      const invalidDsl = 'invalid';
      const error = new Error('Invalid syntax');
      vi.mocked(mermaid.render).mockRejectedValue(error);

      // エラーがスローされることを確認
      await expect(UmlViewer.render('test-container', invalidDsl)).rejects.toThrow(error);

      // コンテナが空になることを確認
      expect(document.getElementById('test-container')?.innerHTML).toBe('');
    });

    it('存在しないコンテナIDでエラーがスローされること', async () => {
      await expect(UmlViewer.render('non-existent', 'graph TD;\nA-->B;')).rejects.toThrow('Container non-existent not found');
    });
  });
}); 