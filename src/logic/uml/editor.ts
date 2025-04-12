import type { UmlEditorState } from '../../models/uml/types';

export class UmlEditor {
  /**
   * DSLを更新する
   * @param state 現在のUMLエディタ状態
   * @param dsl 新しいDSL
   * @returns 更新された状態
   */
  static updateDsl(state: UmlEditorState, dsl: string): UmlEditorState {
    return {
      ...state,
      dsl
    };
  }

  /**
   * モードを切り替える
   * @param state 現在のUMLエディタ状態
   * @returns 更新された状態
   */
  static toggleMode(state: UmlEditorState): UmlEditorState {
    return {
      ...state,
      mode: state.mode === 'editor-viewer' ? 'viewer-only' : 'editor-viewer'
    };
  }

  /**
   * DSLが有効かどうかを検証する
   * @param dsl 検証するDSL
   * @returns DSLが有効な場合はtrue
   */
  static validateDsl(dsl: string): boolean {
    // 基本的な構文チェック
    // - 空文字列は有効
    if (dsl.trim() === '') {
      return true;
    }

    // - 最低限のMermaid構文チェック
    const validStartKeywords = [
      'graph ',
      'sequenceDiagram',
      'classDiagram',
      'stateDiagram',
      'erDiagram',
      'flowchart ',
      'gantt',
      'pie'
    ];

    const firstLine = dsl.trim().split('\n')[0].trim();
    return validStartKeywords.some(keyword => firstLine.startsWith(keyword));
  }

  /**
   * 新しいUMLエディタ状態を作成する
   * @returns 初期状態
   */
  static createInitialState(): UmlEditorState {
    return {
      mode: 'editor-viewer',
      dsl: ''
    };
  }
} 