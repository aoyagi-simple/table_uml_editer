<script lang="ts">
  import { tableStore } from '../../models/state/store';
  import { onMount, onDestroy } from 'svelte';
  import { UmlViewer } from '../../logic/uml/viewer';

  let container: HTMLDivElement;
  let errorMessage = '';

  // Mermaidの初期化
  onMount(() => {
    UmlViewer.initialize();
  });

  onDestroy(() => {
    UmlViewer.clearDebounce();
  });

  // DSLが変更されたら再描画
  $: if (container && $tableStore.uml.dsl !== undefined) {
    try {
      UmlViewer.debounceRender('mermaid-container', $tableStore.uml.dsl)
        .catch((error: Error) => {
          errorMessage = `エラー: ${error.message}`;
        });
    } catch (error) {
      if (error instanceof Error) {
        errorMessage = `エラー: ${error.message}`;
      }
    }
  }
</script>

<div class="viewer">
  {#if errorMessage}
    <div class="error-message" role="alert" data-testid="error-message">{errorMessage}</div>
  {:else}
    <div id="mermaid-container" class="mermaid-container" bind:this={container} data-testid="uml-viewer"></div>
  {/if}
</div>

<style>
  .viewer {
    height: 100%;
    padding: 8px;
    position: relative;
  }

  .mermaid-container {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .error-message {
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    padding: 8px;
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
    border-radius: 4px;
    z-index: 1;
  }

  :global(.container svg) {
    width: 100%;
    height: 100%;
  }
</style> 