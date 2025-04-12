<script lang="ts">
  import { tableStore } from '../../models/state/store';
  import { onMount } from 'svelte';
  import type { AppState } from '../../models/state/types';

  let textarea: HTMLTextAreaElement;
  let dsl = $tableStore.uml.dsl;

  // DSLの値が変更されたら、テキストエリアの値を更新
  $: if (textarea && $tableStore.uml.dsl !== textarea.value) {
    textarea.value = $tableStore.uml.dsl;
  }

  // DSLの更新（1秒debounce）
  let updateTimeout: ReturnType<typeof setTimeout>;
  function handleInput() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      tableStore.update((store: AppState) => ({
        ...store,
        uml: {
          ...store.uml,
          dsl: textarea.value
        }
      }));
    }, 1000);
  }

  onMount(() => {
    textarea.value = dsl;
  });
</script>

<div class="editor">
  <textarea
    bind:this={textarea}
    on:input={handleInput}
    placeholder="Mermaid DSLを入力してください"
  ></textarea>
</div>

<style>
  .editor {
    height: 100%;
    padding: 8px;
  }

  textarea {
    width: 100%;
    height: 100%;
    resize: none;
    font-family: monospace;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
</style> 