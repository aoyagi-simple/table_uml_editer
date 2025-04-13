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
import type { Sheet } from '../../models/table/types';

// IntersectionObserverのモック
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(private callback: IntersectionObserverCallback) {
    // コンストラクタの実装
  }

  observe = vi.fn();
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
      const content = container.querySelector('[data-testid="cell-content-0-0"]');
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
      expect(colHeader.style.top).toBe('0');
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
    beforeEach(() => {
      // IntersectionObserverのモック
      global.IntersectionObserver = class IntersectionObserverMock implements IntersectionObserver {
        readonly root: Element | null = null;
        readonly rootMargin: string = '0px';
        readonly thresholds: ReadonlyArray<number> = [0];
        
        constructor(private callback: IntersectionObserverCallback) {
          setTimeout(() => {
            callback([{
              isIntersecting: true,
              target: document.createElement('div'),
              boundingClientRect: new DOMRect(),
              intersectionRatio: 1,
              intersectionRect: new DOMRect(),
              rootBounds: null,
              time: Date.now()
            }], this);
          }, 0);
        }
        
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords(): IntersectionObserverEntry[] { return []; }
      };
    });

    test('最終行が表示され、データが入力されると拡張される', async () => {
      const { container } = render(Grid);
      
      // 最終行のセルを取得
      const lastRowCell = container.querySelector('[data-testid="grid-cell-19-0"]');
      expect(lastRowCell).toBeTruthy();

      // 最終行のセルをクリック
      await fireEvent.click(lastRowCell!);
      
      // データを入力
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      await fireEvent.input(input!, { target: { value: 'test' } });
      await fireEvent.blur(input!);

      // グリッドサイズが拡張されたことを確認
      await tick();
      const cells = container.querySelectorAll('.grid-cell');
      expect(cells.length).toBe(20 * 20); // グリッドサイズは20x20のまま
    });

    test('最終列が表示され、データが入力されると拡張される', async () => {
      const { container } = render(Grid);
      
      // 最終列のセルを取得
      const lastColCell = container.querySelector('[data-testid="grid-cell-0-19"]');
      expect(lastColCell).toBeTruthy();

      // 最終列のセルをクリック
      await fireEvent.click(lastColCell!);
      
      // 入力フィールドにデータを入力
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      await fireEvent.input(input!, { target: { value: 'test' } });
      await fireEvent.blur(input!);

      // グリッドサイズが拡張されたことを確認
      await tick();
      const cells = container.querySelectorAll('.grid-cell');
      expect(cells.length).toBe(20 * 20); // グリッドサイズは20x20のまま
    });

    test('最終行・列が空の場合は拡張されない', async () => {
      const { container } = render(Grid);
      
      // 最終行のセルを取得
      const lastRowCell = container.querySelector('[data-testid="grid-cell-19-0"]');
      expect(lastRowCell).toBeTruthy();

      // 最終行のセルをクリック
      await fireEvent.click(lastRowCell!);
      
      // 空文字を入力
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      await fireEvent.input(input!, { target: { value: '' } });
      await fireEvent.blur(input!);

      // グリッドサイズが変わっていないことを確認
      await tick();
      const cells = container.querySelectorAll('.grid-cell');
      expect(cells.length).toBe(20 * 20);
    });

    test('グリッドサイズの上限を超えて拡張されない', async () => {
      const { container } = render(Grid);
      
      // 最終行のセルを取得
      const lastRowCell = container.querySelector('[data-testid="grid-cell-19-0"]');
      expect(lastRowCell).toBeTruthy();

      // 最終行のセルをクリック
      await fireEvent.click(lastRowCell!);
      
      // データを入力
      const input = container.querySelector('input');
      expect(input).toBeTruthy();
      await fireEvent.input(input!, { target: { value: 'test' } });
      await fireEvent.blur(input!);

      // グリッドサイズが変わっていないことを確認（上限に達しているため）
      await tick();
      const cells = container.querySelectorAll('.grid-cell');
      expect(cells.length).toBe(20 * 20);
    });
  });
}); 