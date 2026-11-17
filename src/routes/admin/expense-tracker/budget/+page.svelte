<script lang=ts>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let loading = (true);
	let error = ('');
	let budgets = ([]);
	let categories = ([]);
	let showModal = (false);
	let editing = (null);
	let formKtg = (null);
	let formAmount = (0);
	let formPeriod = ('bulanan');
	let formMonth = (new Date().getMonth() + 1);
	let formYear = (new Date().getFullYear());

	function getToken() {
		if (browser) return localStorage.getItem('expense_token');
		return null;
	}

	async function fetchBudgets() {
		const token = getToken();
		if (!token) return;
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/expense-tracker/budgets', {
				headers: { 'Authorization': 'Bearer ' + token }
			});
			if (res.ok) {
				const data = await res.json();
				budgets = data.budgets;
			} else {
				error = 'Could not load data';
			}
		} catch (e) {
			error = String(e);
		} finally {
			loading = false;
		}
	}

	async function fetchCategories() {
		const token = getToken();
		if (!token) return;
		try {
			const res = await fetch('/api/expense-tracker/categories', {
				headers: { 'Authorization': 'Bearer ' + token }
			});
			if (res.ok) {
				const data = await res.json();
				categories = data.categories;
			}
		} catch (e) { /* silent */ }
	}

	function openAdd() {
		editing = null;
		formKtg = null;
		formAmount = 0;
		formPeriod = 'bulanan';
		formMonth = new Date().getMonth() + 1;
		formYear = new Date().getFullYear();
		showModal = true;
	}

	function openEdit(b) {
		editing = b;
		formKtg = b.kategori_id;
		formAmount = b.jumlah;
		formPeriod = b.periode;
		formMonth = b.bulan;
		formYear = b.tahun;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editing = null;
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) closeModal();
	}

	function handleBackdropKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeModal();
	}

	function typeLabel(type: string | null) {
		return type === 'pemasukan' ? 'Income' : type === 'pengeluaran' ? 'Expense' : type || '';
	}

	function periodLabel(period: string) {
		return period === 'bulanan' ? 'Monthly' : period === 'mingguan' ? 'Weekly' : period;
	}

	async function handleSave() {
		const token = getToken();
		if (!token) return;
		loading = true;
		try {
			const method = editing ? 'PUT' : 'POST';
			const body = editing
				? { id: editing.id, kategori_id: formKtg, jumlah: formAmount, periode: formPeriod, bulan: formMonth, tahun: formYear }
				: { kategori_id: formKtg, jumlah: formAmount, periode: formPeriod, bulan: formMonth, tahun: formYear };
			const res = await fetch('/api/expense-tracker/budgets', {
				method,
				headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
				body: JSON.stringify(body)
			});
			if (res.ok) {
				closeModal();
				await fetchBudgets();
			} else {
				const d = await res.json();
				error = d.error || 'Could not save changes';
			}
		} catch (e) {
			error = String(e);
		} finally {
			loading = false;
		}
	}

	async function handleDelete(id) {
		if (!confirm('Delete this budget?')) return;
		const token = getToken();
		if (!token) return;
		loading = true;
		try {
			const res = await fetch('/api/expense-tracker/budgets', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
				body: JSON.stringify({ id })
			});
			if (res.ok) {
				await fetchBudgets();
			} else {
				const d = await res.json();
				error = d.error || 'Could not delete the item';
			}
		} catch (e) {
			error = String(e);
		} finally {
			loading = false;
		}
	}

	onMount(() => { fetchBudgets(); fetchCategories(); });
</script>

<div class="budget-page">
	<header class="page-heading">
		<p class="eyebrow">Expense tracker</p>
		<h2>Budgets</h2>
		<p>Set a spending limit for each category and review it by period.</p>
	</header>

	<div class="toolbar">
		<button class="btn" onclick={openAdd}>+ Add budget</button>
		<span class="error">{error}</span>
	</div>

	{#if loading && !budgets.length}
		<div class="loading">Loading data...</div>
	{:else if budgets.length === 0}
		<div class="empty">No budgets yet. Add one to get started.</div>
	{:else}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Category</th>
						<th>Type</th>
						<th>Amount</th>
						<th>Period</th>
						<th>Month / year</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each budgets as b}
						<tr>
							<td>{b.kategori_nama || 'Uncategorized'} {b.kategori_icon || ''}</td>
							<td><span class:tipe-hijau={b.kategori_tipe === 'pemasukan'}>{typeLabel(b.kategori_tipe)}</span></td>
							<td>IDR {Number(b.jumlah).toLocaleString('en-US')}</td>
							<td>{periodLabel(b.periode)}</td>
							<td>{b.bulan}/{b.tahun}</td>
							<td class="actions">
								<button class="btn-mini" onclick={() => openEdit(b)}>Edit</button>
								<button class="btn-mini delete" onclick={() => handleDelete(b.id)}>Delete</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#if showModal}
	<div class="modal-overlay" role="presentation" tabindex="-1" onclick={handleBackdropClick} onkeydown={handleBackdropKeydown}>
		<div class="modal">
			<h3>{editing ? 'Edit budget' : '+ Add budget'}</h3>
			<div class="form-group">
				<label for=ktg>Category</label>
				<select id=ktg bind:value={formKtg}>
					<option value={null} disabled>-- Choose a category --</option>
					{#each categories as c}
						<option value={c.id}>{c.icon || ''} {c.nama} ({typeLabel(c.tipe)})</option>
					{/each}
				</select>
			</div>
			<div class="form-group">
				<label for=jumlah>Amount (IDR)</label>
				<input id=jumlah type=number bind:value={formAmount} placeholder=1000000 />
			</div>
			<div class="form-group">
				<label for=periode>Period</label>
				<select id=periode bind:value={formPeriod}>
					<option value=bulanan>Monthly</option>
					<option value=mingguan>Weekly</option>
				</select>
			</div>
			<div class="form-row">
				<div class="form-group">
					<label for=bulan>Month</label>
					<input id=bulan type=number min={1} max={12} bind:value={formMonth} />
				</div>
				<div class="form-group">
					<label for=tahun>Year</label>
					<input id=tahun type=number bind:value={formYear} />
				</div>
			</div>
			<div class="modal-actions">
				<button class="btn secondary" onclick={closeModal}>Cancel</button>
				<button class="btn" onclick={handleSave} disabled={loading}>Save</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.budget-page { }
	.page-heading { margin-bottom: 1rem; }
	h2 { margin-bottom: 0.35rem; font-size: clamp(1.6rem, 3vw, 2rem); }
	.page-heading p:last-child { color: var(--text-muted); }
	.eyebrow { color: var(--accent); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}
	.error { color: #ef4444; font-size: 0.85rem; }
	.loading, .empty {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted, #6b7280);
	}
	.table-container {
		overflow-x: auto;
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
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
	.actions { white-space: nowrap; }
	.tipe-hijau { color: #16A34A; font-weight: 500; }
	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 8px;
		background: var(--accent, #7c3aed);
		color: #fff;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.btn:disabled { opacity: 0.5; }
	.btn.secondary { background: #e5e7eb; color: var(--text, #1a1a2e); }
	.btn-mini {
		padding: 0.25rem 0.5rem;
		border: none;
		border-radius: 6px;
		background: #e5e7eb;
		color: var(--text, #1a1a2e);
		font-size: 0.75rem;
		cursor: pointer;
	}
	.btn-mini.delete { color: #ef4444; }
	.modal-overlay {
		position: fixed;
		top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0,0,0,0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	.modal {
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
		padding: 1.5rem;
		width: 100%;
		max-width: 420px;
	}
	.modal h3 { margin-bottom: 1rem; }
	.form-group { margin-bottom: 0.75rem; }
	.form-group label {
		display: block;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--text-muted, #6b7280);
		margin-bottom: 0.25rem;
	}
	.form-group input, .form-group select {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 8px;
		font-size: 0.85rem;
		box-sizing: border-box;
	}
	.form-row {
		display: flex;
		gap: 0.75rem;
	}
	.form-row .form-group { flex: 1; }
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1rem;
	}
</style>
