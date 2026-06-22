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
	let formJumlah = (0);
	let formPeriode = ('bulanan');
	let formBulan = (new Date().getMonth() + 1);
	let formTahun = (new Date().getFullYear());

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
				error = 'Gagal memuat data';
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
		formJumlah = 0;
		formPeriode = 'bulanan';
		formBulan = new Date().getMonth() + 1;
		formTahun = new Date().getFullYear();
		showModal = true;
	}

	function openEdit(b) {
		editing = b;
		formKtg = b.kategori_id;
		formJumlah = b.jumlah;
		formPeriode = b.periode;
		formBulan = b.bulan;
		formTahun = b.tahun;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editing = null;
	}

	async function handleSave() {
		const token = getToken();
		if (!token) return;
		loading = true;
		try {
			const method = editing ? 'PUT' : 'POST';
			const body = editing
				? { id: editing.id, kategori_id: formKtg, jumlah: formJumlah, periode: formPeriode, bulan: formBulan, tahun: formTahun }
				: { kategori_id: formKtg, jumlah: formJumlah, periode: formPeriode, bulan: formBulan, tahun: formTahun };
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
				error = d.error || 'Gagal simpan';
			}
		} catch (e) {
			error = String(e);
		} finally {
			loading = false;
		}
	}

	async function handleDelete(id) {
		if (!confirm('Yakin hapus budget ini?')) return;
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
				error = d.error || 'Gagal hapus';
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
	<h2>Budget & Perencanaan</h2>

	<div class="toolbar">
		<button class="btn" onclick={openAdd}>+ Tambah Budget</button>
		<span class="error">{error}</span>
	</div>

	{#if loading && !budgets.length}
		<div class="loading">Memuat data...</div>
	{:else if budgets.length === 0}
		<div class="empty">Belum ada budget. Klik + Tambah Budget untuk membuat.</div>
	{:else}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Kategori</th>
						<th>Tipe</th>
						<th>Jumlah</th>
						<th>Periode</th>
						<th>Bulan/Tahun</th>
						<th>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#each budgets as b}
						<tr>
							<td>{b.kategori_nama || 'Tanpa kategori'} {b.kategori_icon || ''}</td>
							<td><span class:tipe-hijau={b.kategori_tipe === 'pemasukan'}>{b.kategori_tipe || ''}</span></td>
							<td>Rp {Number(b.jumlah).toLocaleString('id-ID')}</td>
							<td>{b.periode}</td>
							<td>{b.bulan}/{b.tahun}</td>
							<td class="actions">
								<button class="btn-mini" onclick={() => openEdit(b)}>Edit</button>
								<button class="btn-mini" delete onclick={() => handleDelete(b.id)}>Hapus</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#if showModal}
	<div class="modal-overlay" onclick={closeModal}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<h3>{editing ? 'Edit Budget' : '+ Tambah Budget'}</h3>
			<div class="form-group">
				<label for=ktg>Kategori</label>
				<select id=ktg bind:value={formKtg}>
					<option value={null} disabled>-- Pilih Kategori --</option>
					{#each categories as c}
						<option value={c.id}>{c.icon || ''} {c.nama} ({c.tipe})</option>
					{/each}
				</select>
			</div>
			<div class="form-group">
				<label for=jumlah>Jumlah (Rp)</label>
				<input id=jumlah type=number bind:value={formJumlah} placeholder=1000000 />
			</div>
			<div class="form-group">
				<label for=periode>Periode</label>
				<select id=periode bind:value={formPeriode}>
					<option value=bulanan>Bulanan</option>
					<option value=mingguan>Mingguan</option>
				</select>
			</div>
			<div class="form-row">
				<div class="form-group">
					<label for=bulan>Bulan</label>
					<input id=bulan type=number min={1} max={12} bind:value={formBulan} />
				</div>
				<div class="form-group">
					<label for=tahun>Tahun</label>
					<input id=tahun type=number bind:value={formTahun} />
				</div>
			</div>
			<div class="modal-actions">
				<button class="btn" secondary onclick={closeModal}>Batal</button>
				<button class="btn" onclick={handleSave} disabled={loading}>Simpan</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.budget-page { }
	h2 { margin-bottom: 1rem; }
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
