/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import Grid from './Grid.svelte';
import { tableStore } from '../../models/state/store';
import { TableEditor } from '../../logic/table/editor';
import { UmlEditor } from '../../logic/uml/editor';

describe('Grid', () => {
  beforeEach(() => {
    // ストアを初期状態にリセット
    tableStore.set({
      テーブル: TableEditor.createInitialSheet(),
      uml: UmlEditor.createInitialState(),
      splitRatio: 50
    });
  });

  describe('正常系', () => {
    it('セル入力が表示と更新に反映されること', async () => {
      const { container } = render(Grid);
      
      // 最初のセルを取得
      const firstCell = container.querySelector('input');
      expect(firstCell).not.toBeNull();
      
      // セルに値を入力
      await fireEvent.input(firstCell!, { target: { value: 'test' } });
      
      // ストアの値が更新されていることを確認
      const state = get(tableStore);
      expect(state.テーブル[0][0].value).toBe('test');
      
      // 表示が更新されていることを確認
      expect(firstCell!.value).toBe('test');
    });

    it('20×20のグリッドが正しく描画されること', () => {
      const { container } = render(Grid);
      
      // 行数の確認
      const rows = container.querySelectorAll('tr');
      expect(rows.length).toBe(20);
      
      // 各行のセル数を確認
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        expect(cells.length).toBe(20);
      });
    });
  });
}); 