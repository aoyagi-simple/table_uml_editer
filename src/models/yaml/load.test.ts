import { describe, it, expect } from 'vitest';
import { YamlLoader } from './load';
import { YamlSaver } from './save';
import type { AppState } from '../state/store';

describe('YamlLoader', () => {
  // 正常系テスト
  describe('正常系', () => {
    it('YAMLを正しくAppStateに復元できること', () => {
      const yaml = `テーブル:
  C,D,E:
    - - '1'
      - '2'
      - '3'
    - - '4'
      - '5'
      - '6'
    - - '7'
      - '8'
      - '9'
uml:
  mode: editor-viewer
  dsl: |
    graph TD;
    A-->B;
view:
  splitRatio: 30
  umlMode: editor-viewer`;

      const state = YamlLoader.fromYaml(yaml);

      // テーブルデータの検証
      expect(state.テーブル[0][2].value).toBe('1');
      expect(state.テーブル[0][3].value).toBe('2');
      expect(state.テーブル[0][4].value).toBe('3');
      expect(state.テーブル[1][2].value).toBe('4');
      expect(state.テーブル[1][3].value).toBe('5');
      expect(state.テーブル[1][4].value).toBe('6');
      expect(state.テーブル[2][2].value).toBe('7');
      expect(state.テーブル[2][3].value).toBe('8');
      expect(state.テーブル[2][4].value).toBe('9');

      // UMLデータの検証
      expect(state.uml.mode).toBe('editor-viewer');
      expect(state.uml.dsl).toContain('graph TD;');
      expect(state.uml.dsl).toContain('A-->B;');

      // ビューデータの検証
      expect(state.splitRatio).toBe(30);
    });
  });

  // 異常系テスト
  describe('異常系', () => {
    it('不正なYAMLでエラーを投げること', () => {
      const invalidYaml = `テーブル: invalid-yaml`;
      expect(() => YamlLoader.fromYaml(invalidYaml)).toThrow('無効なテーブルデータ形式です');
    });

    it('不正なUMLモードでエラーを投げること', () => {
      const yaml = `テーブル:
  A:
    - - ''
uml:
  mode: invalid-mode
  dsl: ''
view:
  splitRatio: 50
  umlMode: editor-viewer`;

      expect(() => YamlLoader.fromYaml(yaml)).toThrow('無効なUMLモード設定です');
    });

    it('不正な分割比率でエラーを投げること', () => {
      const yaml = `テーブル:
  A:
    - - ''
uml:
  mode: editor-viewer
  dsl: ''
view:
  splitRatio: 100
  umlMode: editor-viewer`;

      expect(() => YamlLoader.fromYaml(yaml)).toThrow('無効な分割比率です');
    });

    it('不正な列インデックスでエラーを投げること', () => {
      const yaml = `テーブル:
  Z:
    - - ''
uml:
  mode: editor-viewer
  dsl: ''
view:
  splitRatio: 50
  umlMode: editor-viewer`;

      expect(() => YamlLoader.fromYaml(yaml)).toThrow('無効な列インデックスです');
    });
  });
}); 