<script lang="ts">
	let {
		startDate = '',
		endDate = '',
		onApply
	}: {
		startDate?: string;
		endDate?: string;
		onApply: (filters: { start: string; end: string }) => void;
	} = $props();

	let sDate = $state('');
	let eDate = $state('');

	$effect(() => {
		sDate = startDate;
		eDate = endDate;
	});

	function apply() {
		onApply({ start: sDate, end: eDate });
	}
</script>

<div class="filter-bar">
	<div class="filter-group">
		<label for="start">From</label>
		<input type="date" id="start" bind:value={sDate} />
	</div>
	<div class="filter-group">
		<label for="end">To</label>
		<input type="date" id="end" bind:value={eDate} />
	</div>
	<button class="btn" onclick={apply}>🔍 Apply</button>
</div>

<style>
	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: flex-end;
		padding: 1rem;
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
		margin-bottom: 1rem;
	}
	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.filter-group label {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--text-muted, #6b7280);
	}
	.filter-group input {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 8px;
		font-size: 0.9rem;
		background: var(--bg, #fafafa);
	}
	.btn {
		padding: 0.5rem 1rem;
		background: var(--accent, #2f7d4a);
		color: #fff;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		font-size: 0.9rem;
		white-space: nowrap;
	}
	.btn:hover {
		background: var(--accent-hover, #1f5a35);
	}
</style>
