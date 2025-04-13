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
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    if (!dsl.trim()) {
      container.innerHTML = '';
      return;
    }

    try {
      const { svg } = await mermaid.render(`mermaid-${Date.now()}`, dsl);
      container.innerHTML = svg;
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      container.innerHTML = '';  // コンテナを空にする
      throw error;
    }
  }

  /**
   * DSLの更新をdebounceして描画する
   * @param containerId レンダリング先のDOM要素ID
   * @param dsl レンダリングするDSL
   * @returns Promise<void>
   */
  static debounceRender(containerId: string, dsl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(async () => {
        try {
          await this.render(containerId, dsl);
          this.debounceTimer = null;
          resolve();
        } catch (error) {
          this.debounceTimer = null;
          reject(error);
        }
      }, this.DEBOUNCE_DELAY);
    });
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