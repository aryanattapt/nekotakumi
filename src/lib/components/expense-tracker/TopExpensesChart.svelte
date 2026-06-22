<script lang="ts">
	let {
		expenses = []
	}: {
		expenses?: { deskripsi: string | null; jumlah: number; sumber: string }[];
	} = $props();

	const fmtRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

	let maxVal = $derived(Math.max(...expenses.map(e => e.jumlah), 0));
</script>

<div class="chart-container">
	<h3>🏆 Pengeluaran Terbesar</h3>
	{#if expenses.length > 0}
		<div class="bars">
			{#each expenses as expense, i}
				<div class="bar-row">
					<div class="label">
						<span class="desc">{(expense.deskripsi || '(no desc)').slice(0, 30)}</span>
						<span class="amount">{fmtRp(expense.jumlah)}</span>
					</div>
					<div class="track">
						<div class="fill" style={`width: ${maxVal ? Math.max((expense.jumlah / maxVal) * 100, 4) : 0}%; background: ${['#7c3aed','#a855f7','#c084fc','#d8b4fe','#10b981','#34d399','#6ee7b7','#f59e0b','#fbbf24','#fcd34d'][i % 10]};`} />
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="empty">Belum ada data</div>
	{/if}
</div>

<style>
	.chart-container {
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
		padding: 1.25rem;
		margin-bottom: 1.5rem;
	}
	h3 {
		margin-bottom: 1rem;
		font-size: 1rem;
	}
	.bars {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}
	.bar-row {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.label {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.85rem;
	}
	.desc {
		font-weight: 500;
	}
	.amount {
		color: var(--text-muted, #6b7280);
		white-space: nowrap;
	}
	.track {
		height: 10px;
		background: #f3f4f6;
		border-radius: 999px;
		overflow: hidden;
	}
	.fill {
		height: 100%;
		border-radius: inherit;
	}
	.empty {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted, #6b7280);
	}
</style>
