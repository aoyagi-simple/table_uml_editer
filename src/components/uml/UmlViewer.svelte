<script lang="ts">
  import { tableStore } from '../../models/state/store';
  import { onMount } from 'svelte';
  import mermaid from 'mermaid';

  let container: HTMLDivElement;
  let error = '';

  // Mermaidの初期化
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default'
  });

  // DSLが変更されたら再描画
  $: if ($tableStore.uml.dsl) {
    error = '';
    try {
      mermaid.render('mermaid-diagram', $tableStore.uml.dsl)
        .then(({ svg }) => {
          container.innerHTML = svg;
        })
        .catch(err => {
          error = 'Mermaid rendering error: ' + err.message;
        });
    } catch (err) {
      error = 'Mermaid error: ' + (err as Error).message;
    }
  }
</script>

<div class="viewer">
  {#if error}
    <div class="error">{error}</div>
  {/if}
  <div bind:this={container} class="container"></div>
</div>

<style>
  .viewer {
    height: 100%;
    padding: 8px;
    position: relative;
  }

  .container {
    height: 100%;
    overflow: auto;
  }

  .error {
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    padding: 8px;
    background-color: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
    color: #c00;
  }

  :global(.container svg) {
    width: 100%;
    height: 100%;
  }
</style> 