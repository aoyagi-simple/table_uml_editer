<!--
  グリッドテーブルコンポーネント
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

  let observer: IntersectionObserver;
  let isLastRowVisible = false;
  let isLastColVisible = false;
  let expandCheckTimeout: NodeJS.Timeout | undefined;
  let expandTimeout: NodeJS.Timeout | undefined;

  // 行と列のインデックス配列を動的に生成
  $: indices = Array.from({ length: Math.max($tableStore.テーブル.length, $tableStore.テーブル[0]?.length || 0) }, (_, i) => i);

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
        const isLastRow = target.dataset.lastRow !== undefined;
        const isLastCol = target.dataset.lastCol !== undefined;

        if (isLastRow) {
          isLastRowVisible = entry.isIntersecting;
        }
        if (isLastCol) {
          isLastColVisible = entry.isIntersecting;
        }

        // 可視性が変更された時に拡張チェックを実行
        if ((isLastRow || isLastCol) && entry.isIntersecting) {
          clearTimeout(expandCheckTimeout);
          expandCheckTimeout = setTimeout(checkAndExpandGrid, 100);
        }
      });
    }, {
      root: null,
      rootMargin: '20px',
      threshold: [0, 0.1, 1.0]
    });
  }

  function checkAndExpandGrid() {
    const currentSheet = $tableStore.テーブル;
    const lastRowIndex = currentSheet.length - 1;
    const lastColIndex = currentSheet[0].length - 1;

    // 最終行または最終列が表示されている場合のみ拡張
    if (isLastRowVisible || isLastColVisible) {
      isExpanding = true;
      const expandedSheet = TableEditor.expandIfNeeded(currentSheet, {
        isLastRowVisible,
        isLastColumnVisible: isLastColVisible
      });
      
      if (expandedSheet.length > currentSheet.length || expandedSheet[0].length > currentSheet[0].length) {
        // アニメーション用のクラスを設定
        expandedSheet.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            if (rowIndex === expandedSheet.length - 1 || colIndex === expandedSheet[0].length - 1) {
              cell.isAnimating = true;
            }
          });
        });

        tableStore.update(state => ({
          ...state,
          テーブル: expandedSheet
        }));

        // アニメーション状態をリセット
        if (expandTimeout) clearTimeout(expandTimeout);
        expandTimeout = setTimeout(() => {
          isExpanding = false;
          tableStore.update(state => ({
            ...state,
            テーブル: state.テーブル.map(row => 
              row.map(cell => ({ ...cell, isAnimating: false }))
            )
          }));
        }, 300);
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
    let label = '';
    let num = col;
    
    do {
      const remainder = num % 26;
      label = String.fromCharCode(65 + remainder) + label;
      num = Math.floor(num / 26) - 1;
    } while (num >= 0);
    
    return label;
  }

  // Intersection Observerを要素にアタッチするアクション
  function observeLastElement(element: HTMLElement) {
    if (observer) {
      observer.observe(element);
      return {
        destroy() {
          observer.unobserve(element);
        }
      };
    }
  }
</script>

<style>
  .grid-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .grid {
    border-collapse: collapse;
    table-layout: fixed;
  }

  .cell {
    border: 1px solid #ccc;
    padding: 4px 8px;
    text-align: left;
    position: relative;
    background: white;
  }

  .grid-cell {
    min-width: 100px;
    height: 24px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .grid-cell.expanding {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
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
    padding: 0;
    margin: 0;
    font: inherit;
    background: transparent;
  }

  input:focus {
    outline: none;
    background: #f0f8ff;
  }

  .row-header {
    position: sticky;
    left: 0;
    z-index: 1;
    background: #f5f5f5;
    text-align: center;
    min-width: 40px;
  }

  .col-header {
    background: #f5f5f5;
    text-align: center;
    z-index: 2;
  }

  .header-row .row-header {
    z-index: 3;
  }

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
  
  .cell-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row-header {
    background-color: #f0f0f0;
    font-weight: bold;
    text-align: center;
    user-select: none;
    position: sticky;
    left: 0;
    z-index: 2;
    width: 40px;
    min-width: 40px;
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

<div class="grid-container" data-testid="grid-container" style="overflow: auto;">
  <table class="grid">
    <thead>
      <tr class="header-row">
        <th class="row-header cell"></th>
        {#each indices as col}
          <th 
            class="col-header cell"
            style="width: {TableEditor.getColumnWidth($tableStore.テーブル, col)}px; position: sticky; top: 0;"
            data-last-col={col === indices.length - 1}
            use:observeLastElement
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
                     height: {TableEditor.getRowHeight($tableStore.テーブル, row)}px;
                     min-width: 100px;"
              data-testid="grid-cell-{row}-{col}"
              data-last-row={row === indices.length - 1}
              data-last-col={col === indices.length - 1}
              use:observeLastElement
            >
              {#if editingCell?.row === row && editingCell?.col === col}
                <input
                  type="text"
                  bind:value={editingValue}
                  on:blur={handleInputBlur}
                  on:keydown={handleInputKeydown}
                />
              {:else}
                <div class="cell-content">
                  {$tableStore.テーブル[row][col].value}
                </div>
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div> 