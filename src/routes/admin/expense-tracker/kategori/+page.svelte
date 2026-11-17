<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let loading = $state(true);
	let error = $state('');
	let categories = $state([]);
	let showModal = $state(false);
	let editing = $state(null);
	let formNama = $state('');
	let formType = $state('pengeluaran');
	let formIcon = $state('');

	function getToken() {
		if (browser) return localStorage.getItem('expense_token');
		return null;
	}

	async function fetchCategories() {
		const token = getToken();
		if (!token) return;
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/expense-tracker/categories', {
				headers: { 'Authorization': 'Bearer ' + token }
			});
			if (res.ok) {
				const data = await res.json();
				categories = data.categories;
			} else {
				error = 'Could not load data';
			}
		} catch (e) {
			error = String(e);
		} finally {
			loading = false;
		}
	}

	function openAdd() {
		editing = null;
		formNama = '';
		formType = 'pengeluaran';
		formIcon = '';
		showModal = true;
	}

	function openEdit(c) {
		editing = c;
		formNama = c.nama;
		formType = c.tipe;
		formIcon = c.icon || '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editing = null;
	}

	function typeLabel(type: string) {
		return type === 'pemasukan' ? 'Income' : type === 'pengeluaran' ? 'Expense' : type;
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) closeModal();
	}

	function handleBackdropKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeModal();
	}

	async function handleSave() {
		const token = getToken();
		if (!token) return;
		loading = true;
		try {
			const method = editing ? 'PUT' : 'POST';
			const body = editing
				? { id: editing.id, nama: formNama, tipe: formType, icon: formIcon }
				: { nama: formNama, tipe: formType, icon: formIcon };
			const res = await fetch('/api/expense-tracker/categories', {
				method,
				headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
				body: JSON.stringify(body)
			});
			if (res.ok) {
				closeModal();
				await fetchCategories();
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
		if (!confirm('Delete this category?')) return;
		const token = getToken();
		if (!token) return;
		loading = true;
		try {
			const res = await fetch('/api/expense-tracker/categories', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
				body: JSON.stringify({ id })
			});
			if (res.ok) {
				await fetchCategories();
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

	onMount(() => fetchCategories());
</script>

<div class="kategori-page">
	<header class="page-heading">
		<p class="eyebrow">Expense tracker</p>
		<h2>Categories</h2>
		<p>Organize the income and expenses that appear in your tracker.</p>
	</header>

	<div class="toolbar">
		<button class="btn" onclick={openAdd}>+ Add category</button>
		<span class="error">{error}</span>
	</div>

	{#if loading && !categories.length}
		<div class="loading">Loading data...</div>
	{:else if categories.length === 0}
		<div class="empty">No categories yet. Add one to get started.</div>
	{:else}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Icon</th>
						<th>Name</th>
						<th>Type</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each categories as c}
						<tr>
							<td>{c.icon || ''}</td>
							<td>{c.nama}</td>
							<td><span class:tipe-hijau={c.tipe === 'pemasukan'}>{typeLabel(c.tipe)}</span></td>
							<td class="actions">
								<button class="btn-mini" onclick={() => openEdit(c)}>Edit</button>
								<button class="btn-mini delete" onclick={() => handleDelete(c.id)}>Delete</button>
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
			<h3>{editing ? 'Edit category' : 'Add category'}</h3>
			<div class="form-group">
				<label for="nama">Category name</label>
				<input id="nama" type="text" bind:value={formNama} placeholder="e.g. Food" />
			</div>
			<div class="form-group">
				<label for="tipe">Type</label>
				<select id="tipe" bind:value={formType}>
					<option value="pengeluaran">Expense</option>
					<option value="pemasukan">Income</option>
				</select>
			</div>
			<div class="form-group">
				<label for="icon">Icon (emoji/text)</label>
				<input id="icon" type="text" bind:value={formIcon} placeholder="e.g. 💰 🏠 🚗" />
			</div>
			<div class="modal-actions">
				<button class="btn secondary" onclick={closeModal}>Cancel</button>
				<button class="btn" onclick={handleSave} disabled={loading}>Save</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.kategori-page { }
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
		background: var(--accent, #2f7d4a);
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
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1rem;
	}
</style>
