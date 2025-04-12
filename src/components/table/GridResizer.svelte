<!--
  グリッドのリサイズハンドルコンポーネント
  - 列幅・行高さの調整用ハンドル
  - マウスドラッグでサイズ変更
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tableStore } from '../../models/state/store';
  import { TableEditor } from '../../logic/table/editor';

  export let type: 'row' | 'column';
  export let index: number;

  let isDragging = false;
  let startPos = 0;
  let startSize = 0;

  function handleMouseDown(event: MouseEvent) {
    isDragging = true;
    startPos = type === 'column' ? event.clientX : event.clientY;
    startSize = type === 'column' 
      ? TableEditor.getColumnWidth($tableStore.テーブル, index)
      : TableEditor.getRowHeight($tableStore.テーブル, index);

    if (typeof document !== 'undefined') {
      document.body.style.cursor = type === 'column' ? 'col-resize' : 'row-resize';
    }
    event.preventDefault();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      isDragging = true;
      startSize = type === 'column' 
        ? TableEditor.getColumnWidth($tableStore.テーブル, index)
        : TableEditor.getRowHeight($tableStore.テーブル, index);
      
      // キーボード操作の場合は、現在の位置を開始位置とする
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      startPos = type === 'column' ? rect.left : rect.top;
    }
  }

  function handleGlobalMouseMove(event: MouseEvent) {
    if (!isDragging) return;

    const currentPos = type === 'column' ? event.clientX : event.clientY;
    const delta = currentPos - startPos;
    const newSize = startSize + delta;

    tableStore.update(state => ({
      ...state,
      テーブル: type === 'column'
        ? TableEditor.setColumnWidth(state.テーブル, index, newSize)
        : TableEditor.setRowHeight(state.テーブル, index, newSize)
    }));
  }

  function handleGlobalMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'default';
    }
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mouseleave', handleGlobalMouseUp);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mouseleave', handleGlobalMouseUp);
    }
  });
</script>

<button 
  type="button"
  class="resize-handle"
  class:column={type === 'column'}
  class:row={type === 'row'}
  role="slider"
  aria-orientation={type === 'column' ? 'vertical' : 'horizontal'}
  aria-valuenow={startSize}
  aria-valuemin="20"
  aria-valuemax="1000"
  aria-label={type === 'column' ? '列幅を調整' : '行高さを調整'}
  on:mousedown={handleMouseDown}
  on:keydown={handleKeyDown}
>
  <div class="handle-line" aria-hidden="true"></div>
</button>

<style>
  .resize-handle {
    position: absolute;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.2s;
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;
  }

  .resize-handle:hover {
    opacity: 1;
  }

  .resize-handle.column {
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: col-resize;
    right: -2px;
  }

  .resize-handle.row {
    left: 0;
    right: 0;
    height: 4px;
    cursor: row-resize;
    bottom: -2px;
  }

  .handle-line {
    position: absolute;
    background: #4a90e2;
  }

  .column .handle-line {
    width: 2px;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
  }

  .row .handle-line {
    height: 2px;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
</style> 