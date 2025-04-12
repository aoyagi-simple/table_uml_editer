/**
 * 分割スライダーロジック
 * 1〜99の範囲で分割比率を管理
 */
export class SplitSlider {
  private static readonly MIN_RATIO = 1;
  private static readonly MAX_RATIO = 99;

  /**
   * 分割比率を更新する
   * @param ratio 新しい分割比率（1〜99）
   * @returns 有効な範囲に収まる分割比率
   */
  static updateRatio(ratio: number): number {
    // 範囲内に収める
    return Math.max(this.MIN_RATIO, Math.min(this.MAX_RATIO, Math.round(ratio)));
  }

  /**
   * 分割比率が有効かどうかを検証する
   * @param ratio 検証する比率
   * @returns 有効な場合はtrue
   */
  static validateRatio(ratio: number): boolean {
    return ratio >= this.MIN_RATIO && ratio <= this.MAX_RATIO;
  }
} 