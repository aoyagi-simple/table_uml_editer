/**
 * ヘルプオーバーレイの状態を管理
 */
export class HelpOverlay {
  private static isVisible = false;

  /**
   * オーバーレイの表示状態を切り替える
   * @returns 新しい表示状態
   */
  static toggle(): boolean {
    this.isVisible = !this.isVisible;
    return this.isVisible;
  }

  /**
   * オーバーレイの表示状態を取得
   * @returns 現在の表示状態
   */
  static isShown(): boolean {
    return this.isVisible;
  }

  /**
   * オーバーレイを非表示にする
   */
  static hide(): void {
    this.isVisible = false;
  }

  /**
   * サンプルデータを取得
   * @returns サンプル設定
   */
  static getSampleData(): { splitRatio: number; umlMode: 'editor-viewer' | 'viewer-only' } {
    return {
      splitRatio: 30,
      umlMode: 'editor-viewer'
    };
  }
} 