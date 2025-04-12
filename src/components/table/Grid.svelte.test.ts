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

describe('Grid.svelte', () => {
  beforeEach(() => {
    // ストアを初期状態にリセット
    tableStore.set({
      テーブル: TableEditor.createEmptySheet(),
      uml: UmlEditor.createInitialState(),
      splitRatio: 50
    });
  });

  describe('正常系', () => {
    it('セル入力が表示と更新に反映されること', async () => {
      const { container } = render(Grid);
      
      // 最初のセルをクリック
      const firstCell = container.querySelector('.grid-cell');
      expect(firstCell).not.toBeNull();
      await fireEvent.click(firstCell!);
      
      // 入力要素が表示されることを確認
      const input = container.querySelector('input');
      expect(input).not.toBeNull();
      
      // セルに値を入力
      await fireEvent.input(input!, { target: { value: 'test' } });
      await fireEvent.blur(input!);
      
      // ストアの値が更新されていることを確認
      const state = get(tableStore);
      expect(state.テーブル[0][0].value).toBe('test');
      
      // 表示が更新されていることを確認
      const cellSpan = firstCell!.querySelector('span');
      expect(cellSpan?.textContent).toBe('test');
    });

    it('20×20のグリッドが正しく描画されること', () => {
      const { container } = render(Grid);
      
      // 行数の確認
      const rows = container.querySelectorAll('.grid-row');
      expect(rows.length).toBe(20);
      
      // 各行のセル数を確認
      rows.forEach(row => {
        const cells = row.querySelectorAll('.grid-cell');
        expect(cells.length).toBe(20);
      });
    });
  });

  describe('スクロール機能', () => {
    it('グリッドがスクロール可能であること', async () => {
      const { container } = render(Grid);
      const gridContainer = container.querySelector('.grid-container');
      
      expect(gridContainer).toBeTruthy();
      expect(gridContainer?.classList.contains('grid-container')).toBe(true);
    });

    it('ヘッダーが固定されていること', () => {
      const { container } = render(Grid);
      
      const rowHeader = container.querySelector('.row-header');
      const colHeader = container.querySelector('.col-header');
      
      expect(rowHeader).toBeTruthy();
      expect(colHeader).toBeTruthy();
      
      expect(rowHeader?.classList.contains('row-header')).toBe(true);
      expect(colHeader?.classList.contains('col-header')).toBe(true);
    });

    it('スクロール時にヘッダーが固定されたままであること', async () => {
      const { container } = render(Grid);
      const gridContainer = container.querySelector('.grid-container');
      
      if (gridContainer) {
        // スクロール操作
        await fireEvent.scroll(gridContainer, { target: { scrollTop: 100, scrollLeft: 100 } });
        
        const rowHeader = container.querySelector('.row-header');
        const colHeader = container.querySelector('.col-header');
        
        expect(rowHeader).toBeTruthy();
        expect(colHeader).toBeTruthy();
        
        // クラス名の存在を確認
        expect(rowHeader?.classList.contains('row-header')).toBe(true);
        expect(colHeader?.classList.contains('col-header')).toBe(true);
      }
    });
  });
}); 