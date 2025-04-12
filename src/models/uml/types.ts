export type UmlEditorMode = 'editor-viewer' | 'viewer-only';

export type UmlEditorState = {
  mode: UmlEditorMode;
  dsl: string;
};

export class UmlEditorModel {
  private state: UmlEditorState;

  constructor() {
    this.state = {
      mode: 'editor-viewer',
      dsl: ''
    };
  }

  getMode(): UmlEditorMode {
    return this.state.mode;
  }

  setMode(mode: UmlEditorMode): void {
    this.validateMode(mode);
    this.state.mode = mode;
  }

  getDsl(): string {
    return this.state.dsl;
  }

  setDsl(dsl: string): void {
    // DSLの基本的な検証（空文字は許可）
    if (typeof dsl !== 'string') {
      throw new Error('DSLは文字列である必要があります');
    }
    this.state.dsl = dsl;
  }

  private validateMode(mode: UmlEditorMode): void {
    if (mode !== 'editor-viewer' && mode !== 'viewer-only') {
      throw new Error('不正なモードです: ' + mode);
    }
  }
} 