import { describe, it, expect } from 'vitest';
import { UmlEditorModel } from './types';

describe('UmlEditorModel', () => {
  // 正常系テスト
  describe('正常系', () => {
    it('モード切替とDSL更新が正しく動作すること', () => {
      const editor = new UmlEditorModel();
      
      // 初期状態の確認
      expect(editor.getMode()).toBe('editor-viewer');
      expect(editor.getDsl()).toBe('');
      
      // モード切替のテスト
      editor.setMode('viewer-only');
      expect(editor.getMode()).toBe('viewer-only');
      
      editor.setMode('editor-viewer');
      expect(editor.getMode()).toBe('editor-viewer');
      
      // DSL更新のテスト
      const testDsl = 'graph TD;\nA-->B;';
      editor.setDsl(testDsl);
      expect(editor.getDsl()).toBe(testDsl);
      
      // 空文字列のDSLも許可
      editor.setDsl('');
      expect(editor.getDsl()).toBe('');
    });
  });

  // 異常系テスト
  describe('異常系', () => {
    it('不正なモードでエラーが発生すること', () => {
      const editor = new UmlEditorModel();
      
      // @ts-expect-error 不正なモードを設定
      expect(() => editor.setMode('invalid-mode')).toThrow('不正なモードです');
    });

    it('不正なDSL型でエラーが発生すること', () => {
      const editor = new UmlEditorModel();
      
      // @ts-expect-error 不正な型のDSLを設定
      expect(() => editor.setDsl(123)).toThrow('DSLは文字列である必要があります');
    });
  });
}); 