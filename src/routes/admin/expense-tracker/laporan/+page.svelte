<script lang=ts>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let loading = (true);
	let error = ('');
	let startDate = ('');
	let endDate = ('');
	let monthly = ([]);
	let summary = (null);

	function getToken() {
		if (browser) return localStorage.getItem('expense_token');
		return null;
	}

	async function fetchReport() {
		const token = getToken();
		if (!token) return;
		loading = true;
		error = '';
		try {
			const url = '/api/expense-tracker/reports?start=' + startDate + '&end=' + endDate;
			const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
			if (res.ok) {
				const data = await res.json();
				monthly = data.monthly;
				summary = data.summary;
			} else {
				error = 'Gagal memuat laporan';
			}
		} catch (e) {
			error = String(e);
		} finally {
			loading = false;
		}
	}

	function applyFilter() {
		if (!startDate || !endDate) return;
		fetchReport();
	}

	function downloadCSV() {
		const token = getToken();
		if (!token) return;
		const url = '/api/expense-tracker/reports?start=' + startDate + '&end=' + endDate + '&format=csv';
		window.open(url, '_blank');
	}

	onMount(() => {
		const today = new Date();
		startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
		endDate = today.toISOString().slice(0, 10);
		fetchReport();
	});
</script>

<div class="laporan-page">
	<h2>Laporan Keuangan</h2>

	<div class="filter-bar">
		<div class="filter-group">
			<label for=start>Dari</label>
			<input type=date id=start bind:value={startDate} />
		</div>
		<div class="filter-group">
			<label for=end>Sampai</label>
			<input type=date id=end bind:value={endDate} />
		</div>
		<button class="btn" onclick={applyFilter}>Terapkan</button>
	</div>

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if summary}
		<div class="summary-cards">
			<div class="summary-card" pemasukan>
				<div class="label">Total Pemasukan</div>
				<div class="value">Rp {Number(summary.total_pemasukan).toLocaleString('id-ID')}</div>
			</div>
			<div class="summary-card" pengeluaran>
				<div class="label">Total Pengeluaran</div>
				<div class="value">Rp {Number(summary.total_pengeluaran).toLocaleString('id-ID')}</div>
			</div>
			<div class="summary-card" selisih>
				<div class="label">Selisih</div>
				<div class="value" class:positif={summary.selisih >= 0}>Rp {Number(summary.selisih).toLocaleString('id-ID')}</div>
			</div>
		</div>

		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Bulan</th>
						<th>Pemasukan</th>
						<th>Pengeluaran</th>
						<th>Selisih</th>
					</tr>
				</thead>
				<tbody>
					{#each monthly as m}
						<tr>
							<td>{m.bulan}</td>
							<td>Rp {Number(m.total_pemasukan).toLocaleString('id-ID')}</td>
							<td>Rp {Number(m.total_pengeluaran).toLocaleString('id-ID')}</td>
							<td class:positif={m.selisih >= 0}>Rp {Number(m.selisih).toLocaleString('id-ID')}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="actions">
			<button class="btn" onclick={downloadCSV}>Download CSV</button>
		</div>
	{:else}
		<div class="empty">Pilih periode dan klik Terapkan untuk melihat laporan.</div>
	{/if}
</div>

<style>
	.laporan-page { }
	h2 { margin-bottom: 1rem; }
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
		font-size: 0.85rem;
	}
	.summary-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.summary-card {
		padding: 1.25rem;
		border-radius: var(--radius, 12px);
		border: 1px solid var(--border, #e5e7eb);
		background: var(--bg-card, #fff);
	}
	.summary-card .label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}
	.summary-card .value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text, #1a1a2e);
	}
	.summary-card.pengeluaran .value { color: #ef4444; }
	.summary-card.selisih .value.positif { color: #16A34A; }
	.summary-card.selisih .value { color: #ef4444; }
	.table-container {
		overflow-x: auto;
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
		margin-bottom: 1rem;
	}
	table { width: 100%; border-collapse: collapse; }
	th, td {
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid var(--border, #e5e7eb);
	}
	th {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted, #6b7280);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	th:last-child, td:last-child { text-align: right; }
	td.positif { color: #16A34A; font-weight: 600; }
	td:not(.positif) { color: #ef4444; }
	.actions { margin-top: 1rem; }
	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 8px;
		background: var(--accent, #7c3aed);
		color: #fff;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.loading, .empty, .error {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted, #6b7280);
	}
	.error { color: #ef4444; }
</style>
