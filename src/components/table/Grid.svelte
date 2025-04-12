<!--
  20×20のグリッドテーブルコンポーネント
  - セルの入力と表示
  - 範囲外のセルは無効
-->
<script lang="ts">
  import type { Sheet } from '../../models/table/types';
  import { TableEditor } from '../../logic/table/editor';
  import { tableStore } from '../../models/state/store';

  // 行と列のサイズ
  const GRID_SIZE = 20;

  // 行と列のインデックス配列
  const indices = Array.from({ length: GRID_SIZE }, (_, i) => i);

  // セルの値を更新
  function updateCell(row: number, col: number, value: string) {
    const newSheet = TableEditor.updateCell($tableStore.テーブル, row, col, value);
    tableStore.update(state => ({
      ...state,
      テーブル: newSheet
    }));
  }
</script>

<div class="grid-container">
  <table>
    <tbody>
      {#each indices as row}
        <tr>
          {#each indices as col}
            <td>
              <input
                type="text"
                value={$tableStore.テーブル[row][col].value}
                on:input={(e) => updateCell(row, col, e.currentTarget.value)}
              />
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .grid-container {
    overflow: auto;
    max-height: 100%;
    max-width: 100%;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  td {
    border: 1px solid #ccc;
    padding: 0;
  }

  input {
    width: 100%;
    height: 100%;
    padding: 4px;
    border: none;
    box-sizing: border-box;
    font-size: 14px;
  }

  input:focus {
    outline: 2px solid #0066cc;
    outline-offset: -2px;
  }
</style> 