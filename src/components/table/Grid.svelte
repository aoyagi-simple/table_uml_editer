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
  import { onMount } from 'svelte';
  import GridResizer from './GridResizer.svelte';
  import { fade } from 'svelte/transition';

  // 行と列のサイズ
  const GRID_SIZE = 20;

  // 行と列のインデックス配列
  const indices = Array.from({ length: GRID_SIZE }, (_, i) => i);

  let editingCell: { row: number; col: number } | null = null;
  let editingValue = '';
  let isExpanding = false;
  let expandTimeout: NodeJS.Timeout;

  // 文字列の幅を計算するためのキャンバス
  let measureCanvas: HTMLCanvasElement;
  
  onMount(() => {
    measureCanvas = document.createElement('canvas');
    return () => {
      clearTimeout(expandTimeout);
    };
  });

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
    
    // 最終行または最終列の入力を検知
    const isLastRow = row === GRID_SIZE - 1;
    const isLastCol = col === GRID_SIZE - 1;
    
    if ((isLastRow || isLastCol) && value.trim() !== '') {
      isExpanding = true;
      clearTimeout(expandTimeout);
      expandTimeout = setTimeout(() => {
        const expandedSheet = TableEditor.expandIfNeeded(newSheet);
        tableStore.update(state => ({
          ...state,
          テーブル: expandedSheet
        }));
        isExpanding = false;
      }, 100);
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
        if (nextCol >= 0 && nextCol < GRID_SIZE) {
          handleCellClick(editingCell.row, nextCol);
        }
      } else if (event.key === 'Enter') {
        const nextRow = editingCell.row + (event.shiftKey ? -1 : 1);
        if (nextRow >= 0 && nextRow < GRID_SIZE) {
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
</script>

<style>
  .grid-container {
    position: relative;
    overflow: auto;
    max-height: 100%;
    max-width: 100%;
  }
  
  .grid {
    border-collapse: collapse;
    table-layout: fixed;
    width: max-content;
  }
  
  .cell {
    border: 1px solid #ccc;
    padding: 4px 8px;
    min-width: 100px;
    height: 24px;
    transition: all 0.2s;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .grid-cell {
    composes: cell;
  }

  .cell:hover {
    background-color: #f5f5f5;
  }

  .cell.expanding {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
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
    z-index: 1;
  }

  .col-header {
    composes: header-cell;
    top: 0;
  }

  .row-header {
    composes: header-cell;
    left: 0;
    width: 40px;
    min-width: 40px;
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
              class:expanding={isExpanding && (row === GRID_SIZE - 1 || col === GRID_SIZE - 1)}
              on:click={() => handleCellClick(row, col)}
              style="width: {TableEditor.getColumnWidth($tableStore.テーブル, col)}px; 
                     height: {TableEditor.getRowHeight($tableStore.テーブル, row)}px;"
              data-testid="grid-cell-{row}-{col}"
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
                  {$tableStore.テーブル[row][col].value}
                </span>
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div> 