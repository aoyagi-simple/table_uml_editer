import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { tableStore } from './store';
import { TableEditor } from '../../logic/table/editor';
import { UmlEditor } from '../../logic/uml/editor';
import { SplitSlider } from '../../logic/split/slider';

describe('AppState Store', () => {
  beforeEach(() => {
    // ストアを初期状態にリセット
    tableStore.set({
      テーブル: TableEditor.createEmptySheet(),
      uml: UmlEditor.createInitialState(),
      splitRatio: 50
    });
  });

  describe('正常系', () => {
    it('テーブル、UML、分割比率の更新が正しく動作すること', () => {
      // テーブルの更新
      const state = get(tableStore);
      const newSheet = TableEditor.updateCell(state.テーブル, 0, 0, 'test');
      tableStore.update(s => ({ ...s, テーブル: newSheet }));
      expect(get(tableStore).テーブル[0][0].value).toBe('test');

      // UMLの更新
      const newUml = { ...state.uml, mode: 'viewer-only' };
      tableStore.update(s => ({ ...s, uml: newUml }));
      expect(get(tableStore).uml.mode).toBe('viewer-only');

      // DSLの更新
      const newDsl = 'graph TD;\nA-->B;';
      tableStore.update(s => ({ ...s, uml: { ...s.uml, dsl: newDsl } }));
      expect(get(tableStore).uml.dsl).toBe(newDsl);

      // 分割比率の更新
      const newRatio = SplitSlider.updateRatio(30);
      tableStore.update(s => ({ ...s, splitRatio: newRatio }));
      expect(get(tableStore).splitRatio).toBe(30);
    });
  });

  describe('異常系', () => {
    it('範囲外の分割比率が補正されること', () => {
      // 最小値未満は1に補正
      tableStore.update(s => ({ ...s, splitRatio: SplitSlider.updateRatio(0) }));
      expect(get(tableStore).splitRatio).toBe(1);

      // 最大値超過は99に補正
      tableStore.update(s => ({ ...s, splitRatio: SplitSlider.updateRatio(100) }));
      expect(get(tableStore).splitRatio).toBe(99);
    });

    it('テーブルの範囲外アクセスでエラーが発生すること', () => {
      const state = get(tableStore);
      expect(() => TableEditor.updateCell(state.テーブル, -1, 0, 'test')).toThrow('セルのインデックスが範囲外です');
      expect(() => TableEditor.updateCell(state.テーブル, 0, 20, 'test')).toThrow('セルのインデックスが範囲外です');
    });

    it('不正なUMLモードでエラーが発生すること', () => {
      const state = get(tableStore);
      // @ts-expect-error 不正なモードを設定
      expect(() => tableStore.update(s => ({ ...s, uml: { ...s.uml, mode: 'invalid-mode' } }))).toThrow();
    });
  });
}); 