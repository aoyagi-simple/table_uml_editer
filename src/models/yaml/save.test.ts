import { describe, it, expect } from 'vitest';
import { YamlSaver } from './save';
import type { AppState } from '../state/store';

describe('YamlSaver', () => {
  // 正常系テスト
  describe('正常系', () => {
    it('データのYAML化が正しく動作すること', () => {
      const state: AppState = {
        テーブル: Array(20).fill(null).map(() => 
          Array(20).fill(null).map(() => ({ value: '' }))
        ),
        uml: {
          mode: 'editor-viewer',
          dsl: 'graph TD;\nA-->B;'
        },
        splitRatio: 30
      };

      // テストデータを設定
      state.テーブル[2][2].value = '1';
      state.テーブル[2][3].value = '2';
      state.テーブル[2][4].value = '3';
      state.テーブル[3][2].value = '4';
      state.テーブル[3][3].value = '5';
      state.テーブル[3][4].value = '6';
      state.テーブル[4][2].value = '7';
      state.テーブル[4][3].value = '8';
      state.テーブル[4][4].value = '9';

      const yaml = YamlSaver.toYaml(state);
      
      // YAMLの形式を確認
      expect(yaml).toContain('テーブル:');
      expect(yaml).toContain('C,D,E:');
      expect(yaml).toContain("- - '1'");
      expect(yaml).toContain("  - '2'");
      expect(yaml).toContain("  - '3'");
      expect(yaml).toContain('uml:');
      expect(yaml).toContain('mode: editor-viewer');
      expect(yaml).toContain('dsl: |-');
      expect(yaml).toContain('  graph TD;');
      expect(yaml).toContain('  A-->B;');
      expect(yaml).toContain('view:');
      expect(yaml).toContain('splitRatio: 30');
      expect(yaml).toContain('umlMode: editor-viewer');
    });
  });

  // 異常系テスト
  describe('異常系', () => {
    it('空データでも最小限のYAMLが出力されること', () => {
      const state: AppState = {
        テーブル: Array(20).fill(null).map(() => 
          Array(20).fill(null).map(() => ({ value: '' }))
        ),
        uml: {
          mode: 'editor-viewer',
          dsl: ''
        },
        splitRatio: 50
      };

      const yaml = YamlSaver.toYaml(state);
      
      // 最小限のYAML構造を確認
      expect(yaml).toContain('テーブル:');
      expect(yaml).toContain('A:');
      expect(yaml).toContain("- - ''");
      expect(yaml).toContain('uml:');
      expect(yaml).toContain('mode: editor-viewer');
      expect(yaml).toContain("dsl: ''");
      expect(yaml).toContain('view:');
      expect(yaml).toContain('splitRatio: 50');
      expect(yaml).toContain('umlMode: editor-viewer');
    });
  });
}); 