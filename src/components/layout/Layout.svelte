<!--
  全体レイアウトコンポーネント
  - テーブルエリアとUMLエリアの分割表示
  - スライダーによる分割比率の調整
  - 右上ボタンの配置
-->
<script lang="ts">
	import Grid from '../table/Grid.svelte';
	import UmlArea from '../uml/UmlArea.svelte';
	import Slider from '../split/Slider.svelte';
	import TopRightButtons from '../buttons/TopRightButtons.svelte';
	import { tableStore } from '../../models/state/store';
	import { YamlLoader } from '../../models/yaml/load';

	let isDragging = false;

	function handleDragEnter(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const files = event.dataTransfer?.files;
		if (!files || files.length === 0) return;

		const file = files[0];
		if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
			alert('YAMLファイルのみ対応しています');
			return;
		}

		try {
			const text = await file.text();
			const newState = YamlLoader.fromYaml(text);
			tableStore.set(newState);
		} catch (error) {
			alert('ファイルの読み込みに失敗しました: ' + (error as Error).message);
		}
	}
</script>

<div
	class="layout"
	on:dragenter={handleDragEnter}
	on:dragleave={handleDragLeave}
	on:dragover={handleDragOver}
	on:drop={handleDrop}
>
	<div class="content" style="--split-ratio: {$tableStore.splitRatio}%">
		<div class="table-area">
			<Grid />
		</div>
		<div class="uml-area">
			<UmlArea />
		</div>
	</div>
	<Slider />
	<TopRightButtons />
	{#if isDragging}
		<div class="drop-overlay">
			<div class="drop-message">YAMLファイルをドロップしてください</div>
		</div>
	{/if}
</div>

<style>
	.layout {
		width: 100%;
		height: 100vh;
		position: relative;
		overflow: hidden;
	}

	.content {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-columns: var(--split-ratio) 1fr;
		gap: 2px;
		background: #eee;
	}

	.table-area,
	.uml-area {
		background: white;
		overflow: hidden;
		position: relative;
	}

	.drop-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(74, 144, 226, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		pointer-events: none;
	}

	.drop-message {
		padding: 20px 40px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		font-size: 16px;
		color: #4a90e2;
	}
</style>
