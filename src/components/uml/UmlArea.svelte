<script lang="ts">
	import { tableStore } from '../../models/state/store';
	import UmlEditor from './UmlEditor.svelte';
	import UmlViewer from './UmlViewer.svelte';

	// モード切替
	function toggleMode() {
		tableStore.update((store) => ({
			...store,
			uml: {
				...store.uml,
				mode: store.uml.mode === 'editor-viewer' ? 'viewer-only' : 'editor-viewer'
			}
		}));
	}
</script>

<div class="uml-area">
	<button class="mode-toggle" on:click={toggleMode}>
		{$tableStore.uml.mode === 'editor-viewer' ? '▶' : '◀'}
	</button>
	<div class="content" class:viewer-only={$tableStore.uml.mode === 'viewer-only'}>
		{#if $tableStore.uml.mode === 'editor-viewer'}
			<div class="editor-container">
				<UmlEditor />
			</div>
		{/if}
		<div class="viewer-container">
			<UmlViewer />
		</div>
	</div>
</div>

<style>
	.uml-area {
		height: 100%;
		position: relative;
	}

	.mode-toggle {
		position: absolute;
		top: 8px;
		left: 8px;
		z-index: 1;
		width: 24px;
		height: 24px;
		border: none;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.9);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		/* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); */
	}

	.mode-toggle:hover {
		background: #fff;
	}

	.content {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.content.viewer-only {
		grid-template-columns: 1fr;
	}

	.editor-container,
	.viewer-container {
		height: 100%;
		overflow: hidden;
		/* position: relative; */
	}
</style>
