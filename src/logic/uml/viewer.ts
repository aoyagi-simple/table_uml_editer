import type { UmlEditorState } from '../../models/uml/types';
import mermaid from 'mermaid';

export class UmlViewer {
  private static debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly DEBOUNCE_DELAY = 1000; // 1秒

  /**
   * Mermaid.jsの初期化
   */
  static initialize(): void {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'strict'
    });
  }

  /**
   * DSLをレンダリングする
   * @param containerId レンダリング先のDOM要素ID
   * @param dsl レンダリングするDSL
   * @returns Promise<void>
   */
  static async render(containerId: string, dsl: string): Promise<void> {
    if (!dsl.trim()) {
      document.getElementById(containerId)!.innerHTML = '';
      return;
    }

    try {
      const { svg } = await mermaid.render(`mermaid-${Date.now()}`, dsl);
      document.getElementById(containerId)!.innerHTML = svg;
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      document.getElementById(containerId)!.innerHTML = `<div class="error">UML描画エラー</div>`;
    }
  }

  /**
   * DSLの更新をdebounceして描画する
   * @param containerId レンダリング先のDOM要素ID
   * @param dsl レンダリングするDSL
   * @returns Promise<void>
   */
  static debounceRender(containerId: string, dsl: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.render(containerId, dsl);
      this.debounceTimer = null;
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * debounceタイマーをクリアする
   */
  static clearDebounce(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
} 