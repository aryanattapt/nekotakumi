<script lang="ts">
	import StatCard from './StatCard.svelte';

	let { sources = [], grandTotal = 0 }: { sources?: { sumber: string; count: number; total: number }[]; grandTotal?: number } = $props();

	const sourceColors: Record<string, string> = {
		JENIUS: '#10b981',
		MANDIRI: '#3b82f6',
		LIVIN: '#3b82f6',
		BCA: '#f59e0b',
		BCA_CC: '#f59e0b',
		TOKOPEDIA: '#ef4444',
		GRAB: '#8b5cf6'
	};

	function fmtRp(val: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
	}
</script>

<div class="summary-view">
	{#if sources.length === 0}
		<div class="empty">No transactions in this period</div>
	{:else}
		<div class="cards">
			{#each sources as source}
				<StatCard
					title={source.sumber}
					count={source.count}
					total={source.total}
					color={sourceColors[source.sumber] || '#2f7d4a'}
				/>
			{/each}
		</div>
		<div class="grand-total">
			<span class="label">Total Expense</span>
			<span class="amount">{fmtRp(grandTotal)}</span>
		</div>
	{/if}
</div>

<style>
	.summary-view {
		margin-bottom: 1.5rem;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.grand-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		background: var(--accent, #2f7d4a);
		color: #fff;
		border-radius: var(--radius, 12px);
	}
	.label {
		font-weight: 500;
		font-size: 1rem;
	}
	.amount {
		font-size: 1.5rem;
		font-weight: 700;
	}
	.empty {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted, #6b7280);
	}
</style>
