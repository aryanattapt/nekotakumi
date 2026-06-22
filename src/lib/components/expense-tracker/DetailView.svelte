<script lang="ts">
	interface Transaksi {
		id: number;
		tanggal: string;
		sumber: string;
		jenis: string | null;
		deskripsi: string | null;
		jumlah: number;
		via_jenius: boolean;
	}

	let {
		transactions = [],
		total = 0,
		page = 1,
		limit = 50,
		onPageChange
	}: {
		transactions?: Transaksi[];
		total?: number;
		page?: number;
		limit?: number;
		onPageChange?: (page: number) => void;
	} = $props();

	function fmtRp(val: number): string {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
	}

	// Group by sumber
	let sortedGroups: [string, { rows: Transaksi[]; subtotal: number }][] = $derived.by(() => {
		const groups = new Map<string, { rows: Transaksi[]; subtotal: number }>();
		for (const t of transactions) {
			if (t.via_jenius) continue;
			if (!groups.has(t.sumber)) {
				groups.set(t.sumber, { rows: [], subtotal: 0 });
			}
			const g = groups.get(t.sumber)!;
			g.rows.push(t);
			g.subtotal += t.jumlah;
		}
		return Array.from(groups.entries()).sort((a, b) => b[1].subtotal - a[1].subtotal);
	});

	let viaJeniusRows: Transaksi[] = $derived(transactions.filter(t => t.via_jenius));

	const totalPages = $derived(Math.ceil(total / limit));
	const grandTotal = $derived(sortedGroups.reduce((sum, [, g]) => sum + g.subtotal, 0));
</script>

<div class="detail-view">
	{#if transactions.length === 0}
		<div class="empty">Tidak ada transaksi di periode ini</div>
	{:else}
		{#each sortedGroups as [sumber, group]}
			<div class="group">
				<div class="group-header">
					<span class="group-name">─── {sumber} ───</span>
					<span class="group-subtotal">{fmtRp(group.subtotal)}</span>
				</div>
				<div class="group-rows">
					{#each group.rows as txn}
						<div class="row">
							<span class="date">{txn.tanggal}</span>
							<span class="jenis">{txn.jenis || ''}</span>
							<span class="deskripsi">{txn.deskripsi || ''}</span>
							<span class="jumlah">{fmtRp(txn.jumlah)}</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}

		{#if viaJeniusRows.length > 0}
			<div class="group via-jenius">
				<div class="group-header dimmed">
					<span class="group-name">─── Info Tambahan (via Jenius) ───</span>
				</div>
				<div class="group-rows">
					{#each viaJeniusRows as txn}
						<div class="row dimmed">
							<span class="date">{txn.tanggal}</span>
							<span class="sumber">{txn.sumber}</span>
							<span class="deskripsi">{txn.deskripsi || ''}</span>
							<span class="jumlah">{fmtRp(txn.jumlah)}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="grand-total">
			<span>TOTAL</span>
			<span>{fmtRp(grandTotal)}</span>
		</div>

		{#if totalPages > 1}
			<div class="pagination">
				<button disabled={page <= 1} onclick={() => onPageChange?.(page - 1)}>← Prev</button>
				<span>Halaman {page} dari {totalPages}</span>
				<button disabled={page >= totalPages} onclick={() => onPageChange?.(page + 1)}>Next →</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.detail-view {
		margin-bottom: 1.5rem;
	}
	.group {
		margin-bottom: 1rem;
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
		overflow: hidden;
	}
	.group-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: #f3f4f6;
		font-weight: 600;
		font-size: 0.9rem;
	}
	.group-name {
		color: var(--text, #1a1a2e);
	}
	.group-subtotal {
		color: var(--accent, #7c3aed);
	}
	.group-rows {
		padding: 0.25rem 0;
	}
	.row {
		display: flex;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		font-size: 0.85rem;
		align-items: center;
		border-bottom: 1px solid #f3f4f6;
	}
	.row:last-child {
		border-bottom: none;
	}
	.date { width: 100px; color: var(--text-muted, #6b7280); flex-shrink: 0; }
	.sumber { width: 80px; font-weight: 500; flex-shrink: 0; }
	.jenis { width: 100px; color: var(--text-muted, #6b7280); flex-shrink: 0; }
	.deskripsi { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.jumlah { width: 120px; text-align: right; font-weight: 600; flex-shrink: 0; }
	.dimmed { opacity: 0.5; }
	.grand-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		background: var(--accent, #7c3aed);
		color: #fff;
		border-radius: var(--radius, 12px);
		font-weight: 700;
		font-size: 1.1rem;
		margin-top: 1rem;
	}
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-top: 1rem;
	}
	.pagination button {
		padding: 0.5rem 1rem;
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 8px;
		background: var(--bg-card, #fff);
		cursor: pointer;
		font-size: 0.9rem;
	}
	.pagination button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.empty {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted, #6b7280);
	}
</style>
