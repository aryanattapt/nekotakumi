<script lang="ts">
	let { children } = $props();
</script>

<div class="expense-shell">
	<div class="top-bar">
		<h1>Expense Tracker</h1>
	</div>
	{@render children()}
</div>

<style>
	.expense-shell {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}
	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 0.25rem;
	}
	.top-bar h1 {
		font-size: 1.5rem;
	}
</style>
