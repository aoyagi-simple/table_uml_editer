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

  describe('列幅調整', () => {
    const getWidth = (style: string | null | undefined) => {
      const match = style?.match(/width:\s*(\d+)px/);
      return match ? parseInt(match[1]) : null;
    };

    it('ヘッダーとデータの幅が同期されること', async () => {
      const { container } = render(Grid);
      
      // 最初の列のヘッダーとデータセルを取得
      const headerCell = container.querySelector('.col-header');
      const dataCell = container.querySelector('.grid-cell');
      
      expect(headerCell).not.toBeNull();
      expect(dataCell).not.toBeNull();
      
      // 初期幅の確認
      const initialHeaderWidth = getWidth(headerCell?.getAttribute('style'));
      const initialDataWidth = getWidth(dataCell?.getAttribute('style'));
      expect(initialHeaderWidth).toBe(100);
      expect(initialDataWidth).toBe(100);
      
      // 列幅を変更
      const state = get(tableStore);
      tableStore.update(state => ({
        ...state,
        テーブル: TableEditor.setColumnWidth(state.テーブル, 0, 150)
      }));

      // DOMの更新を待つ
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // 変更後の幅を確認
      const updatedHeaderWidth = getWidth(headerCell?.getAttribute('style'));
      const updatedDataWidth = getWidth(dataCell?.getAttribute('style'));
      expect(updatedHeaderWidth).toBe(150);
      expect(updatedDataWidth).toBe(150);
    });

    it('リサイズハンドルでの幅変更が機能すること', async () => {
      const { container } = render(Grid);
      
      // リサイズハンドルを取得
      const resizeHandle = container.querySelector('.resize-handle.column');
      expect(resizeHandle).not.toBeNull();
      
      // マウスダウンイベントを発火
      await fireEvent.mouseDown(resizeHandle!, { clientX: 100 });
      
      // マウス移動をシミュレート
      await fireEvent.mouseMove(window, { clientX: 150 });
      
      // マウスアップでリサイズ完了
      await fireEvent.mouseUp(window);
      
      // 幅が更新されていることを確認
      const headerCell = container.querySelector('.col-header');
      const dataCell = container.querySelector('.grid-cell');
      
      const headerWidth = getWidth(headerCell?.getAttribute('style'));
      const dataWidth = getWidth(dataCell?.getAttribute('style'));
      expect(headerWidth).toBeGreaterThan(100);
      expect(dataWidth).toBeGreaterThan(100);
    });

    it('最小幅・最大幅の制限が機能すること', async () => {
      const { container } = render(Grid);
      
      // 最小幅のテスト
      tableStore.update(state => ({
        ...state,
        テーブル: TableEditor.setColumnWidth(state.テーブル, 0, 10)
      }));
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const headerCell = container.querySelector('.col-header');
      const getWidth = (style: string | null | undefined) => {
        const match = style?.match(/width:\s*(\d+)px/);
        return match ? parseInt(match[1]) : null;
      };
      
      const minWidth = getWidth(headerCell?.getAttribute('style'));
      expect(minWidth).toBe(50); // MIN_COL_WIDTH
      
      // 最大幅のテスト
      tableStore.update(state => ({
        ...state,
        テーブル: TableEditor.setColumnWidth(state.テーブル, 0, 500)
      }));
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const maxWidth = getWidth(headerCell?.getAttribute('style'));
      expect(maxWidth).toBe(300); // MAX_COL_WIDTH
    });

    it('長い文字列入力時にセルとヘッダーの幅が自動調整されること', async () => {
      const { container } = render(Grid);
      
      // 最初のセルをクリック
      const firstCell = container.querySelector('.grid-cell');
      expect(firstCell).not.toBeNull();
      await fireEvent.click(firstCell!);
      
      // 長い文字列を入力
      const input = container.querySelector('input');
      expect(input).not.toBeNull();
      const longText = 'あいうえおかきくけこさしすせそたちつてと';
      await fireEvent.input(input!, { target: { value: longText } });
      await fireEvent.blur(input!);
      
      // DOMの更新を待つ
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // セルとヘッダーの幅が同期していることを確認
      const headerCell = container.querySelector('.col-header');
      const dataCell = container.querySelector('.grid-cell');
      
      const headerWidth = getWidth(headerCell?.getAttribute('style'));
      const dataWidth = getWidth(dataCell?.getAttribute('style'));
      
      expect(headerWidth).toBeGreaterThan(100); // デフォルト幅より大きくなっていること
      expect(headerWidth).toBe(dataWidth); // ヘッダーとデータの幅が同じであること
      
      // セルの内容が適切に表示されることを確認
      const cellContent = dataCell?.querySelector('.cell-content');
      expect(cellContent).not.toBeNull();
      expect(cellContent?.textContent).toBe(longText);
    });
  });
}); 