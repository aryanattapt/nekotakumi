<script lang="ts">
	import { page } from '$app/state';
	import Sidebar from '$lib/components/expense-tracker/Sidebar.svelte';

	let { children } = $props();

	let currentPath = $derived(page.url.pathname);
</script>

<div class="app-layout">
	<Sidebar {currentPath} />
	<main class="content">
		<div class="top-bar">
			<h1>Expense Tracker</h1>
		</div>
		{@render children()}
	</main>
</div>

<style>
	.app-layout {
		display: flex;
		gap: 1.5rem;
		max-width: 1100px;
		margin: 0 auto;
		padding: 1rem;
	}
	.content {
		flex: 1;
		min-width: 0;
	}
	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	.top-bar h1 {
		font-size: 1.5rem;
	}
</style>
