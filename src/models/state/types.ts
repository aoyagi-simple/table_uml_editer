import type { Sheet } from '../table/types';
import type { UmlEditorState } from '../uml/types';

export type AppState = {
  テーブル: Sheet;
  uml: UmlEditorState;
  splitRatio: number;
}; 