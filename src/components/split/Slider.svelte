<script lang="ts">
  import { tableStore } from '../../models/state/store';
  import { SplitSlider } from '../../logic/split/slider';
  import { onMount, onDestroy } from 'svelte';

  let isDragging = false;
  let ratio = $tableStore.splitRatio;
  let container: HTMLDivElement;

  // ストアの更新を監視
  $: ratio = $tableStore.splitRatio;

  function handleMouseDown(event: MouseEvent) {
    isDragging = true;
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'col-resize';
    }
    event.preventDefault();
  }

  function handleGlobalMouseMove(event: MouseEvent) {
    if (!isDragging || !container) return;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const newRatio = Math.round((x / rect.width) * 100);
    
    const validRatio = SplitSlider.updateRatio(newRatio);
    tableStore.update(store => ({
      ...store,
      splitRatio: validRatio
    }));
  }

  function handleGlobalMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'default';
    }
  }

  // コンポーネントのマウント時にグローバルイベントを設定
  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mouseleave', handleGlobalMouseUp);
    }
  });

  // コンポーネントの破棄時にグローバルイベントを解除
  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mouseleave', handleGlobalMouseUp);
    }
  });
</script>

<div class="splitter-container" bind:this={container}>
  <div 
    class="splitter"
    class:dragging={isDragging}
    on:mousedown={handleMouseDown}
    style="left: {ratio}%"
  >
    <div class="handle"></div>
  </div>
</div>

<style>
  .splitter-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    pointer-events: none;
  }

  .splitter {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 8px;
    transform: translateX(-50%);
    background: transparent;
    cursor: col-resize;
    pointer-events: auto;
    transition: background-color 0.2s;
  }

  .splitter:hover,
  .splitter.dragging {
    background: rgba(74, 144, 226, 0.1);
  }

  .handle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 40px;
    background: #4a90e2;
    border-radius: 2px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .splitter:hover .handle,
  .splitter.dragging .handle {
    opacity: 1;
  }
</style> 