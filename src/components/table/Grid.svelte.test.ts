/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, test } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import Grid from './Grid.svelte';
import { tableStore } from '../../models/state/store';
import { TableEditor } from '../../logic/table/editor';
import { UmlEditor } from '../../logic/uml/editor';
import { tick } from 'svelte';
import type { Sheet, Cell } from '../../models/table/types';

// IntersectionObserverのモック
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(private callback: IntersectionObserverCallback) {
    // コンストラクタの実装
  }

  observe = vi.fn((target: Element) => {
    // 監視開始時にコールバックを呼び出し
    setTimeout(() => {
      this.callback([{
        isIntersecting: true,
        target,
        boundingClientRect: new DOMRect(),
        intersectionRatio: 1,
        intersectionRect: new DOMRect(),
        rootBounds: null,
        time: Date.now()
      }], this);
    }, 0);
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

describe('Grid.svelte', () => {
  beforeEach(() => {
    // テーブルストアを初期化
    tableStore.set({
      テーブル: TableEditor.createEmptySheet(),
      umlモード: 'クラス図',
      分割比率: 50
    });
    
    // モックをリセット
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('セル入力が表示と更新に反映されること', async () => {
      const { container } = render(Grid);
      
      // セルをクリック
      const cell = container.querySelector('[data-testid="grid-cell-0-0"]');
      expect(cell).toBeTruthy();
      await fireEvent.click(cell!);
      
      // 入力フィールドにデータを入力
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      await fireEvent.input(input!, { target: { value: 'test' } });
      await fireEvent.blur(input!);
      
      // 入力値が反映されていることを確認
      const content = container.querySelector('.cell-content');
      expect(content?.textContent?.trim()).toBe('test');
    });

    it('初期グリッドが正しく描画されること', () => {
      const { container } = render(Grid);
      const cells = container.querySelectorAll('.grid-cell');
      expect(cells.length).toBe(400);
    });
  });

  describe('スクロール機能', () => {
    it('グリッドがスクロール可能であること', () => {
      const { container } = render(Grid);
      const gridContainer = container.querySelector('.grid-container') as HTMLElement;
      expect(gridContainer.style.overflow).toBe('auto');
    });

    it('ヘッダーが固定されていること', () => {
      const { container } = render(Grid);
      const colHeader = container.querySelector('.col-header') as HTMLElement;
      expect(colHeader.style.position).toBe('sticky');
    });

    it('スクロール時にヘッダーが固定されたままであること', () => {
      const { container } = render(Grid);
      const colHeader = container.querySelector('.col-header') as HTMLElement;
      expect(colHeader.style.top).toBe('0px');
    });
  });

  describe('列幅調整', () => {
    const getWidth = (style: string | null | undefined) => {
      const match = style?.match(/width:\s*(\d+)px/);
      return match ? parseInt(match[1]) : null;
    };

    it('ヘッダーとデータの幅が同期されること', () => {
      const { container } = render(Grid);
      const colHeader = container.querySelector('.col-header') as HTMLElement;
      const dataCell = container.querySelector('.grid-cell') as HTMLElement;
      expect(colHeader.style.width).toBe(dataCell.style.width);
    });

    it('リサイズハンドルでの幅変更が機能すること', async () => {
      const { container } = render(Grid);
      const resizeHandle = container.querySelector('.resize-handle.column');
      expect(resizeHandle).toBeTruthy();
    });

    it('最小幅・最大幅の制限が機能すること', () => {
      const { container } = render(Grid);
      const cell = container.querySelector('.grid-cell') as HTMLElement;
      expect(cell.style.minWidth).toBe('100px');
    });

    it('長い文字列入力時にセルとヘッダーの幅が自動調整されること', async () => {
      const { container } = render(Grid);
      const cell = container.querySelector('[data-testid="grid-cell-0-0"]');
      expect(cell).toBeTruthy();

      // セルをクリック
      await fireEvent.click(cell!);
      const input = container.querySelector('input');
      expect(input).toBeTruthy();

      // 長い文字列を入力
      const longText = 'This is a very long text that should cause the cell to expand';
      await fireEvent.input(input!, { target: { value: longText } });
      await fireEvent.blur(input!);

      // 幅が調整されたことを確認
      const updatedCell = container.querySelector('.grid-cell') as HTMLElement;
      expect(parseInt(updatedCell.style.width)).toBeGreaterThan(TableEditor.DEFAULT_COL_WIDTH);
    });
  });

  describe('動的拡張機能', () => {
    test('最終行が表示され、データがある場合に無制限に拡張される', async () => {
      const { container } = render(Grid);
      
      // 100回の拡張をシミュレート
      for (let i = 0; i < 100; i++) {
        const state = get(tableStore);
        const lastRowIndex = state.テーブル.length - 1;
        const lastRowCell = container.querySelector(`[data-testid="grid-cell-${lastRowIndex}-0"]`);
        expect(lastRowCell).toBeTruthy();
        
        await fireEvent.click(lastRowCell!);
        const input = container.querySelector('input');
        expect(input).toBeTruthy();
        await fireEvent.input(input!, { target: { value: `test${i}` } });
        await fireEvent.blur(input!);

        await tick();
      }

      // グリッドが正しく拡張されたことを確認
      const state = get(tableStore);
      expect(state.テーブル.length).toBeGreaterThan(100);
      expect(state.テーブル[100].some((cell: { value: string }) => cell.value === 'test99')).toBe(true);
    });

    test('最終列が表示され、データがある場合に無制限に拡張される', async () => {
      const { container } = render(Grid);
      
      // 100回の拡張をシミュレート
      for (let i = 0; i < 100; i++) {
        const state = get(tableStore);
        const lastColIndex = state.テーブル[0].length - 1;
        const lastColCell = container.querySelector(`[data-testid="grid-cell-0-${lastColIndex}"]`);
        expect(lastColCell).toBeTruthy();
        
        await fireEvent.click(lastColCell!);
        const input = container.querySelector('input');
        expect(input).toBeTruthy();
        await fireEvent.input(input!, { target: { value: `test${i}` } });
        await fireEvent.blur(input!);

        await tick();
      }

      // グリッドが正しく拡張されたことを確認
      const state = get(tableStore);
      expect(state.テーブル[0].length).toBeGreaterThan(100);
      expect(state.テーブル[0][100].value === 'test99').toBe(true);
    });

    test('大量データ時のパフォーマンス', async () => {
      const { container } = render(Grid);
      const startTime = performance.now();
      
      // 1000セルにデータを入力
      for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 20; j++) {
          const cell = container.querySelector(`[data-testid="grid-cell-${i}-${j}"]`);
          expect(cell).toBeTruthy();
          
          await fireEvent.click(cell!);
          const input = container.querySelector('input');
          expect(input).toBeTruthy();
          await fireEvent.input(input!, { target: { value: `test${i}-${j}` } });
          await fireEvent.blur(input!);

          await tick();
        }
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // 1000セルの入力が10秒以内に完了することを確認
      expect(executionTime).toBeLessThan(10000);
      
      // メモリ使用量を確認（Node.jsの場合）
      if (typeof process !== 'undefined') {
        const memoryUsage = process.memoryUsage();
        // ヒープメモリが1GB未満であることを確認
        expect(memoryUsage.heapUsed).toBeLessThan(1024 * 1024 * 1024);
      }
    });

    test('アニメーション状態が正しく管理される', async () => {
      const { container } = render(Grid);
      
      // 最終行のセルにデータを入力
      const state = get(tableStore);
      const lastRowIndex = state.テーブル.length - 1;
      const lastRowCell = container.querySelector(`[data-testid="grid-cell-${lastRowIndex}-0"]`);
      expect(lastRowCell).toBeTruthy();
      await fireEvent.click(lastRowCell!);
      
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      await fireEvent.input(input!, { target: { value: 'test' } });
      await fireEvent.blur(input!);

      await tick();
      
      // アニメーション状態を確認
      const updatedState = get(tableStore);
      const newRow = updatedState.テーブル[updatedState.テーブル.length - 1];
      expect(newRow.every((cell: Cell) => cell.isAnimating)).toBe(true);

      // アニメーション終了を待機
      await new Promise(resolve => setTimeout(resolve, 300));
      await tick();

      // アニメーション状態がリセットされたことを確認
      const finalState = get(tableStore);
      const updatedRow = finalState.テーブル[finalState.テーブル.length - 1];
      expect(updatedRow.every((cell: Cell) => !cell.isAnimating)).toBe(true);
    });

    test('空の最終行・列は拡張されない', async () => {
      const { container } = render(Grid);
      
      // 空の最終行・列を表示
      const lastRowCell = container.querySelector('[data-testid="grid-cell-19-0"]');
      const lastColCell = container.querySelector('[data-testid="grid-cell-0-19"]');
      expect(lastRowCell).toBeTruthy();
      expect(lastColCell).toBeTruthy();

      await tick();
      
      // グリッドサイズが変更されていないことを確認
      const state = get(tableStore);
      expect(state.テーブル.length).toBe(20);
      expect(state.テーブル[0].length).toBe(20);
    });
  });
}); 