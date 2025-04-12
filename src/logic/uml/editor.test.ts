import { describe, it, expect } from 'vitest';
import { UmlEditor } from './editor';

describe('UmlEditor', () => {
  describe('正常系', () => {
    it('DSL反映とモード切替が正しく動作すること', () => {
      const state = UmlEditor.createInitialState();
      
      // DSL更新の確認
      const newDsl = 'graph TD;\nA-->B;';
      const updatedState = UmlEditor.updateDsl(state, newDsl);
      expect(updatedState.dsl).toBe(newDsl);
      expect(updatedState.mode).toBe('editor-viewer');
      
      // モード切替の確認
      const toggledState = UmlEditor.toggleMode(updatedState);
      expect(toggledState.mode).toBe('viewer-only');
      expect(toggledState.dsl).toBe(newDsl);
      
      // 再度モード切替
      const toggledBackState = UmlEditor.toggleMode(toggledState);
      expect(toggledBackState.mode).toBe('editor-viewer');
      expect(toggledBackState.dsl).toBe(newDsl);
    });

    it('DSL検証が正しく動作すること', () => {
      // 空文字列は有効
      expect(UmlEditor.validateDsl('')).toBe(true);
      expect(UmlEditor.validateDsl('  ')).toBe(true);
      
      // 有効なDSL
      expect(UmlEditor.validateDsl('graph TD;\nA-->B;')).toBe(true);
      expect(UmlEditor.validateDsl('sequenceDiagram\nA->>B: Hello')).toBe(true);
      expect(UmlEditor.validateDsl('classDiagram\nClass01 <|-- Class02')).toBe(true);
      expect(UmlEditor.validateDsl('stateDiagram\ns1 --> s2')).toBe(true);
      expect(UmlEditor.validateDsl('erDiagram\nCUSTOMER ||--o{ ORDER')).toBe(true);
      expect(UmlEditor.validateDsl('flowchart LR\nA-->B')).toBe(true);
      expect(UmlEditor.validateDsl('gantt\ntitle A Gantt Diagram')).toBe(true);
      expect(UmlEditor.validateDsl('pie\n"A" : 100')).toBe(true);
    });

    it('初期状態が正しく作成されること', () => {
      const state = UmlEditor.createInitialState();
      expect(state.mode).toBe('editor-viewer');
      expect(state.dsl).toBe('');
    });
  });

  describe('異常系', () => {
    it('不正なDSLが検出されること', () => {
      // 不正なDSL
      expect(UmlEditor.validateDsl('invalid')).toBe(false);
      expect(UmlEditor.validateDsl('graphviz {}')).toBe(false);
      expect(UmlEditor.validateDsl('A-->B')).toBe(false);
    });
  });
}); 