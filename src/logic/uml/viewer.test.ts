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
      UmlViewer.debounceRender('test-container', dsl);
      
      // タイマーを進める
      await vi.advanceTimersByTimeAsync(1000);
      
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

      // 複数回の更新
      UmlViewer.debounceRender('test-container', 'first');
      await vi.advanceTimersByTimeAsync(500);
      UmlViewer.debounceRender('test-container', dsl);
      await vi.advanceTimersByTimeAsync(1000);

      // 最後の更新のみが反映されることを確認
      expect(mermaid.render).toHaveBeenCalledTimes(1);
      expect(mermaid.render).toHaveBeenCalledWith(expect.any(String), dsl);
    });
  });

  describe('異常系', () => {
    it('不正なDSLでエラーが表示されること', async () => {
      const invalidDsl = 'invalid';
      vi.mocked(mermaid.render).mockRejectedValue(new Error('Invalid syntax'));

      await UmlViewer.render('test-container', invalidDsl);

      expect(document.getElementById('test-container')?.innerHTML).toBe('<div class="error">UML描画エラー</div>');
    });
  });
}); 