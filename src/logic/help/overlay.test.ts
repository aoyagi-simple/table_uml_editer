import { describe, it, expect, beforeEach } from 'vitest';
import { HelpOverlay } from './overlay';

describe('HelpOverlay', () => {
  beforeEach(() => {
    // 各テスト前にオーバーレイを非表示にする
    HelpOverlay.hide();
  });

  describe('正常系', () => {
    it('オーバーレイ表示と閉じるが正しく動作すること', () => {
      // 初期状態は非表示
      expect(HelpOverlay.isShown()).toBe(false);
      
      // 表示に切り替え
      expect(HelpOverlay.toggle()).toBe(true);
      expect(HelpOverlay.isShown()).toBe(true);
      
      // 非表示に切り替え
      expect(HelpOverlay.toggle()).toBe(false);
      expect(HelpOverlay.isShown()).toBe(false);
    });

    it('強制的な非表示が動作すること', () => {
      // 表示状態にする
      HelpOverlay.toggle();
      expect(HelpOverlay.isShown()).toBe(true);
      
      // 強制的に非表示
      HelpOverlay.hide();
      expect(HelpOverlay.isShown()).toBe(false);
    });

    it('サンプルデータが正しく取得できること', () => {
      const sample = HelpOverlay.getSampleData();
      
      expect(sample).toEqual({
        splitRatio: 30,
        umlMode: 'editor-viewer'
      });
    });
  });
}); 