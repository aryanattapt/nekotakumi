<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let loading = $state(true);
	let exportingFormat = $state('');
	let error = $state('');
	let startDate = $state('');
	let endDate = $state('');
	let monthly = $state<{ bulan: string; total: number }[]>([]);
	let summary = $state<{ total: number } | null>(null);
	const formatCurrency = (value: number) =>
		new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);

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
			const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
			if (res.ok) {
				const data = await res.json();
				monthly = data.monthly || [];
				summary = data.summary || null;
			} else {
				error = 'Could not load the report';
			}
		} catch (e) {
			error = String(e);
		} finally {
			loading = false;
		}
	}

	function buildFilename(format: 'csv' | 'xlsx' | 'pdf') {
		return `expense-report-${startDate}-to-${endDate}.${format}`;
	}

	async function downloadReport(format: 'csv' | 'xlsx' | 'pdf') {
		const token = getToken();
		if (!token) return;
		exportingFormat = format;
		error = '';
		try {
			const url = '/api/expense-tracker/reports?start=' + startDate + '&end=' + endDate + '&format=' + format;
			const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || 'Could not download the report');
			}
			const blob = await res.blob();
			const objectUrl = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = objectUrl;
			link.download = buildFilename(format);
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(objectUrl);
		} catch (e) {
			error = String(e);
		} finally {
			exportingFormat = '';
		}
	}

	function applyFilter() {
		if (!startDate || !endDate) return;
		fetchReport();
	}

	onMount(() => {
		const today = new Date();
		startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
		endDate = today.toISOString().slice(0, 10);
		fetchReport();
	});
</script>

<svelte:head>
	<title>Expense reports — Nekotakumi Labs</title>
	<meta
		name="description"
		content="Review monthly expense totals and export transaction reports."
	/>
</svelte:head>

<div class="laporan-page">
	<section class="hero">
		<div>
			<p class="eyebrow">Expense tracker</p>
			<h2>Expense reports</h2>
			<p class="lead">Monthly totals are based on transaction details. Income is not included in this report.</p>
		</div>

		<div class="summary-card">
			<span class="label">Total Expense</span>
			<strong>{formatCurrency(summary?.total || 0)}</strong>
		</div>
	</section>

	<div class="filter-bar">
		<div class="filter-group">
			<label for="start">From</label>
			<input type="date" id="start" bind:value={startDate} />
		</div>
		<div class="filter-group">
			<label for="end">To</label>
			<input type="date" id="end" bind:value={endDate} />
		</div>
		<button class="btn" onclick={applyFilter}>Apply</button>
	</div>

	{#if loading}
		<div class="state-card">Loading data...</div>
	{:else if error}
		<div class="state-card error">{error}</div>
	{:else}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Month</th>
						<th>Total</th>
					</tr>
				</thead>
				<tbody>
					{#if monthly.length === 0}
						<tr>
							<td colspan="2" class="empty-row">No data for this period.</td>
						</tr>
					{:else}
						{#each monthly as m}
							<tr>
								<td>{m.bulan}</td>
								<td>{formatCurrency(m.total)}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<div class="actions">
			<button class="btn" onclick={() => downloadReport('csv')} disabled={!!exportingFormat || loading}>
				{exportingFormat === 'csv' ? 'Preparing CSV...' : 'Download CSV'}
			</button>
			<button class="btn secondary" onclick={() => downloadReport('xlsx')} disabled={!!exportingFormat || loading}>
				{exportingFormat === 'xlsx' ? 'Preparing XLSX...' : 'Download XLSX'}
			</button>
			<button class="btn secondary" onclick={() => downloadReport('pdf')} disabled={!!exportingFormat || loading}>
				{exportingFormat === 'pdf' ? 'Preparing PDF...' : 'Download PDF'}
			</button>
		</div>
	{/if}
</div>

<style>
	.laporan-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.hero {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px solid var(--border, #e5e7eb);
		border-radius: calc(var(--radius, 12px) * 1.1);
		background: var(--card);
	}

	.eyebrow {
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent, #2f7d4a);
	}

	h2 {
		margin-bottom: 0.45rem;
		font-size: 1.6rem;
	}

	.lead {
		max-width: 58ch;
		color: var(--text-muted, #6b7280);
	}

	.summary-card {
		min-width: 220px;
		padding: 1rem 1.15rem;
		border-radius: 1rem;
		background: #fff;
		border: 1px solid var(--border, #e5e7eb);
		box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
	}

	.summary-card .label {
		display: block;
		margin-bottom: 0.35rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted, #6b7280);
	}

	.summary-card strong {
		font-size: 1.6rem;
		line-height: 1.1;
	}

	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: flex-end;
		padding: 1rem;
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
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

	.table-container {
		overflow-x: auto;
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
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

	td:last-child,
	th:last-child {
		text-align: right;
	}

	.empty-row {
		text-align: center;
		color: var(--text-muted, #6b7280);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 8px;
		background: var(--accent, #2f7d4a);
		color: #fff;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.btn.secondary {
		background: #e5e7eb;
		color: var(--text, #1a1a2e);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.state-card {
		text-align: center;
		padding: 2rem;
		border-radius: 1rem;
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		color: var(--text-muted, #6b7280);
	}

	.state-card.error {
		color: #ef4444;
	}

	@media (max-width: 720px) {
		.hero {
			flex-direction: column;
			align-items: stretch;
		}

		.summary-card {
			min-width: 0;
		}
	}
</style>
