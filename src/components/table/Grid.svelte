<!--
  20×20のグリッドテーブルコンポーネント
  - セルの入力と表示
  - 範囲外のセルは無効
  - リサイズハンドルの追加
-->
<script lang="ts">
  import type { Sheet } from '../../models/table/types';
  import { TableEditor } from '../../logic/table/editor';
  import { tableStore } from '../../models/state/store';
  import { onMount } from 'svelte';
  import GridResizer from './GridResizer.svelte';

  // 行と列のサイズ
  const GRID_SIZE = 20;

  // 行と列のインデックス配列
  const indices = Array.from({ length: GRID_SIZE }, (_, i) => i);

  let editingCell: { row: number; col: number } | null = null;
  let editingValue = '';

  // セルの値を更新
  function updateCell(row: number, col: number, value: string) {
    const newSheet = TableEditor.updateCell($tableStore.テーブル, row, col, value);
    tableStore.update(state => ({
      ...state,
      テーブル: newSheet
    }));
  }

  function handleCellClick(row: number, col: number) {
    editingCell = { row, col };
    editingValue = $tableStore.テーブル[row][col].value;
  }

  function handleInputBlur() {
    if (editingCell) {
      const { row, col } = editingCell;
      tableStore.update(state => ({
        ...state,
        テーブル: TableEditor.updateCell(state.テーブル, row, col, editingValue)
      }));
      editingCell = null;
    }
  }

  function handleInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      handleInputBlur();
    } else if (event.key === 'Escape') {
      editingCell = null;
    }
  }

  const focusOnMount = (node: HTMLElement) => {
    node.focus();
  };
</script>

{#if $tableStore}
<div class="grid-wrapper">
  <!-- 列ヘッダー（固定） -->
  <div class="col-header" role="rowheader" style="position: absolute; top: 0; left: 24px; right: 0;">
    {#each Array(20) as _, col}
      <div class="header-cell" style="width: {TableEditor.getColumnWidth($tableStore.テーブル, col)}px">
        {String.fromCharCode(65 + col)}
        <GridResizer type="column" index={col} />
      </div>
    {/each}
  </div>

  <div class="grid-scroll-container">
    <!-- 行ヘッダー（固定） -->
    <div class="row-header" role="columnheader" style="position: sticky; left: 0;">
      {#each Array(20) as _, row}
        <div class="header-cell" style="height: {TableEditor.getRowHeight($tableStore.テーブル, row)}px">
          {row + 1}
          <GridResizer type="row" index={row} />
        </div>
      {/each}
    </div>

    <!-- グリッドコンテナ（スクロール可能） -->
    <div class="grid-container" role="grid" style="overflow: auto;">
      {#each $tableStore.テーブル as row, rowIndex}
        <div class="grid-row" style="height: {TableEditor.getRowHeight($tableStore.テーブル, rowIndex)}px">
          {#each row as cell, colIndex}
            <div class="grid-cell"
                 role="gridcell"
                 tabindex="0"
                 style="width: {TableEditor.getColumnWidth($tableStore.テーブル, colIndex)}px"
                 on:click={() => handleCellClick(rowIndex, colIndex)}
                 on:keydown={(e) => {
                   if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     handleCellClick(rowIndex, colIndex);
                   }
                 }}>
              {#if editingCell?.row === rowIndex && editingCell?.col === colIndex}
                <input
                  type="text"
                  bind:value={editingValue}
                  on:blur={handleInputBlur}
                  on:keydown={handleInputKeydown}
                  use:focusOnMount
                />
              {:else}
                <span>{cell.value}</span>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>
{/if}

<style>
  .grid-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .grid-scroll-container {
    display: flex;
    height: calc(100% - 24px); /* 列ヘッダーの高さを引く */
    margin-top: 24px; /* 列ヘッダーの高さ */
  }

  .col-header {
    height: 24px;
    display: flex;
    background-color: #f5f5f5;
    z-index: 2;
  }

  .row-header {
    width: 24px;
    background-color: #f5f5f5;
    z-index: 1;
  }

  .grid-container {
    flex: 1;
    position: relative;
  }

  .grid-row {
    display: flex;
  }

  .header-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ddd;
    background-color: #f5f5f5;
    position: relative;
  }

  .grid-cell {
    border: 1px solid #ddd;
    padding: 4px;
    position: relative;
    display: flex;
    align-items: center;
  }

  input {
    width: 100%;
    height: 100%;
    border: none;
    padding: 0;
    margin: 0;
    font-family: inherit;
    font-size: inherit;
  }

  input:focus {
    outline: 2px solid #4a90e2;
  }
</style> 