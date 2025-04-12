import { writable } from 'svelte/store';
import type { AppState } from './types';
import { TableEditor } from '../../logic/table/editor';
import { UmlEditor } from '../../logic/uml/editor';

// 初期状態の作成
const initialState: AppState = {
  テーブル: TableEditor.createEmptySheet(),
  uml: UmlEditor.createInitialState(),
  splitRatio: 50
};

function createStore() {
  const { subscribe, set, update } = writable<AppState>(initialState);

  return {
    subscribe,
    set,
    update: (fn: (state: AppState) => AppState) => {
      update(state => {
        const newState = fn(state);
        // UMLモードのバリデーション
        if (newState.uml.mode !== 'editor-viewer' && newState.uml.mode !== 'viewer-only') {
          throw new Error('不正なUMLモードです');
        }
        return newState;
      });
    },
    reset: () => set(initialState)
  };
}

export const tableStore = createStore(); 