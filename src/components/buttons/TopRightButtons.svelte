<script lang="ts">
  import { tableStore } from '../../models/state/store';
  import { YamlSaver } from '../../models/yaml/save';
  import { HelpOverlay } from '../../logic/help/overlay';

  let showHelp = false;

  // ヘルプ表示の切り替え
  function toggleHelp() {
    showHelp = !showHelp;
  }

  // YAMLファイルの保存
  function handleSave() {
    try {
      const yaml = YamlSaver.toYaml($tableStore);
      const blob = new Blob([yaml], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'table-uml-data.yaml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('保存に失敗しました: ' + (error as Error).message);
    }
  }

  // サンプルデータ
  const sampleData = HelpOverlay.getSampleData();
  const sampleDsl = `graph TD;
    A[開始] --> B{条件分岐}
    B -->|Yes| C[処理1]
    B -->|No| D[処理2]
    C --> E[終了]
    D --> E`;

  // キーボードイベントの処理
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showHelp) {
      toggleHelp();
    }
  }
</script>

<div class="buttons">
  <button class="save" on:click={handleSave}>
    保存
  </button>
  <button 
    class="help" 
    on:click={toggleHelp} 
    aria-label="ヘルプを表示"
    aria-expanded={showHelp}
    aria-controls="help-dialog"
  >
    {showHelp ? '戻る' : '?'}
  </button>
</div>

{#if showHelp}
  <div
    class="overlay"
    role="dialog"
    id="help-dialog"
    aria-modal="true"
    aria-labelledby="help-title"
    on:click={toggleHelp}
    on:keydown={handleKeyDown}
  >
    <div
      class="help-content"
      role="document"
      on:click|stopPropagation
      on:keydown|stopPropagation={handleKeyDown}
    >
      <h2 id="help-title">使い方</h2>
      <section>
        <h3>テーブル編集</h3>
        <p>20×20のグリッドにデータを入力できます。</p>
      </section>
      <section>
        <h3>UML編集</h3>
        <p>Mermaid DSLを使ってUMLを描画できます。</p>
        <p>右上の三角ボタンでエディター表示を切り替えられます。</p>
      </section>
      <section>
        <h3>画面分割</h3>
        <p>中央のスライダーで画面の分割比率を調整できます（推奨値: {sampleData.splitRatio}%）。</p>
      </section>
      <section>
        <h3>サンプル</h3>
        <pre>{sampleDsl}</pre>
      </section>
    </div>
  </div>
{/if}

<style>
  .buttons {
    position: fixed;
    top: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
    z-index: 100;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .save {
    background: #4a90e2;
    color: white;
  }

  .save:hover {
    background: #357abd;
  }

  .help {
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 50%;
    background: #eee;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .help:hover {
    background: #ddd;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .help-content {
    background: white;
    padding: 24px;
    border-radius: 8px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
  }

  h2 {
    margin: 0 0 16px;
    font-size: 24px;
  }

  section {
    margin-bottom: 16px;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    color: #333;
  }

  p {
    margin: 0 0 8px;
    color: #666;
  }

  pre {
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
  }
</style> 