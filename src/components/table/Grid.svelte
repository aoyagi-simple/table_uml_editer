<!--
  20×20のグリッドテーブルコンポーネント
  - セルの入力と表示
  - 範囲外のセルは無効
  - リサイズハンドルの追加
  - 動的追加UI
-->
<script lang="ts">
  import type { Sheet } from '../../models/table/types';
  import { TableEditor } from '../../logic/table/editor';
  import { tableStore } from '../../models/state/store';
  import { onMount, onDestroy } from 'svelte';
  import GridResizer from './GridResizer.svelte';
  import { fade } from 'svelte/transition';

  let gridSize = 0;
  let observer: IntersectionObserver;
  let isLastRowVisible = false;
  let isLastColVisible = false;
  let expandCheckTimeout: NodeJS.Timeout | undefined;
  let expandTimeout: NodeJS.Timeout | undefined;

  // 行と列のインデックス配列を動的に生成
  $: {
    const currentSheet = $tableStore.テーブル;
    gridSize = Math.max(currentSheet.length, currentSheet[0]?.length || 0);
  }

  $: indices = Array.from({ length: gridSize }, (_, i) => i);

  let editingCell: { row: number; col: number } | null = null;
  let editingValue = '';
  let isExpanding = false;

  // 文字列の幅を計算するためのキャンバス
  let measureCanvas: HTMLCanvasElement;
  
  onMount(() => {
    measureCanvas = document.createElement('canvas');
    setupIntersectionObserver();
    return () => {
      if (expandTimeout) clearTimeout(expandTimeout);
      if (expandCheckTimeout) clearTimeout(expandCheckTimeout);
      if (observer) {
        observer.disconnect();
      }
    };
  });

  function setupIntersectionObserver() {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const target = entry.target as HTMLElement;
        if (target.dataset.lastRow !== undefined) {
          isLastRowVisible = entry.isIntersecting;
        }
        if (target.dataset.lastCol !== undefined) {
          isLastColVisible = entry.isIntersecting;
        }

        // 可視性が変更された時に拡張チェックを実行
        clearTimeout(expandCheckTimeout);
        expandCheckTimeout = setTimeout(checkAndExpandGrid, 100);
      });
    }, {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    });
  }

  function checkAndExpandGrid() {
    const currentSheet = $tableStore.テーブル;
    const lastRowIndex = currentSheet.length - 1;
    const lastColIndex = currentSheet[0].length - 1;

    // 最終行・列のデータ存在チェック
    const lastRowHasData = currentSheet[lastRowIndex]?.some(cell => cell.value.trim() !== '');
    const lastColHasData = currentSheet.some(row => row[lastColIndex]?.value.trim() !== '');

    if ((isLastRowVisible && lastRowHasData) || (isLastColVisible && lastColHasData)) {
      isExpanding = true;
      const expandedSheet = TableEditor.expandIfNeeded(currentSheet, {
        isLastRowVisible,
        isLastColumnVisible: isLastColVisible
      });
      
      if (expandedSheet.length > currentSheet.length || expandedSheet[0].length > currentSheet[0].length) {
        tableStore.update(state => ({
          ...state,
          テーブル: expandedSheet
        }));
        
        // グリッドサイズを更新
        gridSize = Math.max(expandedSheet.length, expandedSheet[0].length);

        // アニメーション状態をリセット
        setTimeout(() => {
          const updatedSheet = expandedSheet.map(row => 
            row.map(cell => ({ ...cell, isAnimating: false }))
          );
          tableStore.update(state => ({
            ...state,
            テーブル: updatedSheet
          }));
          isExpanding = false;
        }, 300);
      } else {
        isExpanding = false;
      }
    }
  }

  // 文字列の幅を計算
  function measureTextWidth(text: string): number {
    if (!measureCanvas) {
      measureCanvas = document.createElement('canvas');
    }
    const ctx = measureCanvas.getContext('2d');
    if (!ctx) return TableEditor.MIN_COL_WIDTH;
    
    // 実際のスタイルを取得
    const headerCell = document.querySelector('.col-header');
    const computedStyle = headerCell 
      ? window.getComputedStyle(headerCell)
      : { font: '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' };
    
    ctx.font = computedStyle.font;
    
    // パディングとボーダーを考慮
    const textWidth = Math.ceil(ctx.measureText(text).width);
    const padding = 16; // 8px * 2 for padding
    const border = 2;  // 1px * 2 for borders
    
    return Math.max(
      TableEditor.MIN_COL_WIDTH,
      Math.min(
        textWidth + padding + border,
        TableEditor.MAX_COL_WIDTH
      )
    );
  }

  // セルの値を更新
  function updateCell(row: number, col: number, value: string) {
    const newSheet = TableEditor.updateCell($tableStore.テーブル, row, col, value);
    
    // 文字列の幅を計算
    const textWidth = measureTextWidth(value);
    const currentWidth = TableEditor.getColumnWidth(newSheet, col);
    const headerWidth = measureTextWidth(getColumnLabel(col));
    const newWidth = Math.max(textWidth, headerWidth, currentWidth);
    
    // 幅の更新が必要な場合
    if (newWidth > currentWidth) {
      newSheet[0][col].width = Math.min(newWidth, TableEditor.MAX_COL_WIDTH);
    }

    // 値が更新された後に拡張チェックを実行
    if (value.trim() !== '') {
      const expandedSheet = TableEditor.expandIfNeeded(newSheet);
      if (expandedSheet !== newSheet) {
        isExpanding = true;
        if (expandTimeout) clearTimeout(expandTimeout);
        expandTimeout = setTimeout(() => {
          isExpanding = false;
        }, 300);
      }
      tableStore.update(state => ({
        ...state,
        テーブル: expandedSheet
      }));
    } else {
      tableStore.update(state => ({
        ...state,
        テーブル: newSheet
      }));
    }
  }

  function handleCellClick(row: number, col: number) {
    if (editingCell?.row === row && editingCell?.col === col) return;
    editingCell = { row, col };
    editingValue = $tableStore.テーブル[row][col].value;
    // 次のフレームで入力フィールドにフォーカス
    requestAnimationFrame(() => {
      const input = document.querySelector('input');
      if (input) input.focus();
    });
  }

  function handleInputBlur() {
    if (editingCell) {
      const { row, col } = editingCell;
      updateCell(row, col, editingValue);
      editingCell = null;
    }
  }

  function handleInputKeydown(event: KeyboardEvent) {
    if (!editingCell) return;

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      handleInputBlur();

      // 次のセルに移動
      if (event.key === 'Tab') {
        const nextCol = editingCell.col + (event.shiftKey ? -1 : 1);
        if (nextCol >= 0) {
          handleCellClick(editingCell.row, nextCol);
        }
      } else if (event.key === 'Enter') {
        const nextRow = editingCell.row + (event.shiftKey ? -1 : 1);
        if (nextRow >= 0) {
          handleCellClick(nextRow, editingCell.col);
        }
      }
    } else if (event.key === 'Escape') {
      editingCell = null;
    }
  }

  // 列ヘッダーのラベルを生成
  function getColumnLabel(col: number): string {
    return String.fromCharCode(65 + col);
  }

  // Intersection Observerを要素にアタッチするアクション
  function observeLastElement(node: HTMLElement, isLast: boolean) {
    if (observer && isLast) {
      observer.observe(node);
    }

    return {
      destroy() {
        if (observer) {
          observer.unobserve(node);
        }
      },
      update(newIsLast: boolean) {
        if (observer) {
          if (newIsLast) {
            observer.observe(node);
          } else {
            observer.unobserve(node);
          }
        }
      }
    };
  }
</script>

<style>
  .grid-container {
    position: relative;
    overflow: auto;
    max-height: 100vh;
    max-width: 100%;
    height: 100%;
    border: 1px solid #ccc;
  }
  
  .grid {
    border-collapse: collapse;
    table-layout: fixed;
    width: max-content;
    height: max-content;
  }
  
  .cell {
    border: 1px solid #ccc;
    padding: 4px 8px;
    min-width: 80px;
    height: 24px;
    transition: all 0.2s;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    background-color: white;
  }

  .grid-cell {
    composes: cell;
  }

  .cell:hover {
    background-color: #f5f5f5;
  }

  .cell.expanding {
    animation: fadeIn 0.3s ease-in-out;
    background-color: #f0f8ff;
  }

  @keyframes fadeIn {
    from { 
      opacity: 0;
      transform: scale(0.95);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
  
  input {
    width: 100%;
    height: 100%;
    border: none;
    padding: 2px;
    box-sizing: border-box;
    background: transparent;
  }
  
  input:focus {
    outline: 2px solid #4a90e2;
    background: white;
  }

  .cell-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-cell {
    background-color: #f0f0f0;
    font-weight: bold;
    text-align: center;
    user-select: none;
    position: sticky;
    z-index: 2;
  }

  .col-header {
    composes: header-cell;
    top: 0;
    background-color: #f0f0f0;
  }

  .row-header {
    composes: header-cell;
    left: 0;
    width: 40px;
    min-width: 40px;
    background-color: #f0f0f0;
  }

  /* 左上のヘッダーセルの固定 */
  .row-header.cell:first-child {
    position: sticky;
    left: 0;
    top: 0;
    z-index: 3;
    background-color: #f0f0f0;
  }

  .header-row {
    display: table-row;
  }

  .grid-row {
    display: table-row;
  }

  /* リサイズハンドルのスタイル調整 */
  :global(.resize-handle) {
    position: absolute;
    z-index: 2;
  }

  :global(.resize-handle.column) {
    top: 0;
    bottom: 0;
    right: -4px;
    width: 8px;
  }

  :global(.resize-handle.row) {
    left: 0;
    right: 0;
    bottom: -4px;
    height: 8px;
  }
</style>

<div class="grid-container" data-testid="grid-container">
  <table class="grid">
    <thead>
      <tr class="header-row">
        <th class="row-header cell"></th>
        {#each indices as col}
          <th 
            class="col-header cell"
            style="width: {TableEditor.getColumnWidth($tableStore.テーブル, col)}px;"
            data-last-col={col === indices.length - 1}
            use:observeLastElement={col === indices.length - 1}
          >
            {getColumnLabel(col)}
            <GridResizer type="column" index={col} />
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each indices as row}
        <tr class="grid-row">
          <td class="row-header cell">
            {row + 1}
            <GridResizer type="row" index={row} />
          </td>
          {#each indices as col}
            <td 
              class="grid-cell cell" 
              class:expanding={isExpanding && (row === indices.length - 1 || col === indices.length - 1)}
              on:click={() => handleCellClick(row, col)}
              style="width: {TableEditor.getColumnWidth($tableStore.テーブル, col)}px; 
                     height: {TableEditor.getRowHeight($tableStore.テーブル, row)}px;"
              data-testid="grid-cell-{row}-{col}"
              data-last-row={row === indices.length - 1}
              data-last-col={col === indices.length - 1}
              use:observeLastElement={(row === indices.length - 1) || (col === indices.length - 1)}
            >
              {#if editingCell?.row === row && editingCell?.col === col}
                <input
                  type="text"
                  bind:value={editingValue}
                  on:blur={handleInputBlur}
                  on:keydown={handleInputKeydown}
                  data-testid="cell-input"
                />
              {:else}
                <span class="cell-content" data-testid="cell-content-{row}-{col}">
                  {$tableStore.テーブル[row]?.[col]?.value ?? ''}
                </span>
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div> 