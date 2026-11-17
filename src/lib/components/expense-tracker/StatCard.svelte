<script lang="ts">
	let { title, count, total, color = '#2f7d4a' }: { title: string; count: number; total: number; color?: string } = $props();

	function fmtRp(val: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
	}
</script>

<div class="stat-card" style="--card-color: {color}">
	<div class="card-header">
		<span class="title">{title}</span>
		<span class="count">{count} transactions</span>
	</div>
	<div class="amount">{fmtRp(total)}</div>
</div>

<style>
	.stat-card {
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
		padding: 1.25rem;
		border-left: 4px solid var(--card-color);
		transition: transform 0.15s, box-shadow 0.15s;
	}
	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.08);
	}
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	.title {
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--text, #1a1a2e);
	}
	.count {
		font-size: 0.8rem;
		color: var(--text-muted, #6b7280);
	}
	.amount {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--card-color);
	}
</style>
