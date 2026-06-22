<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let loading = $state(false);
	let error = $state('');
	let success = $state('');
	let dbStatus = $state(null);
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	function getToken() {
		if (browser) return localStorage.getItem('expense_token');
		return null;
	}

	async function checkDB() {
		const token = getToken();
		if (!token) return;
		try {
			const res = await fetch('/api/expense-tracker/settings', {
				headers: { 'Authorization': 'Bearer ' + token }
			});
			if (res.ok) {
				const data = await res.json();
				dbStatus = data.db_status;
			}
		} catch (e) {
			dbStatus = 'disconnected';
		}
	}

	async function handleChangePassword() {
		if (newPassword !== confirmPassword) {
			error = 'Password baru tidak sama';
			return;
		}
		if (newPassword.length < 6) {
			error = 'Password minimal 6 karakter';
			return;
		}

		const token = getToken();
		if (!token) return;
		loading = true;
		error = '';
		success = '';
		try {
			const res = await fetch('/api/expense-tracker/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
				body: JSON.stringify({ currentPassword, newPassword })
			});
			const data = await res.json();
			if (res.ok) {
				success = data.message || 'Password berhasil diubah';
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
			} else {
				error = data.error || 'Gagal mengganti password';
			}
		} catch (e) {
			error = String(e);
		} finally {
			loading = false;
		}
	}

	onMount(() => checkDB());
</script>

<div class="pengaturan-page">
	<h2>Pengaturan</h2>

	<div class="card">
		<div class="card-header">
			<h3>Status Koneksi Database</h3>
		</div>
		<div class="card-body">
			{#if dbStatus === null}
				<span class="status loading">Mengecek...</span>
			{:else if dbStatus === 'connected'}
				<span class="status connected">Terhubang</span>
			{:else}
				<span class="status disconnected">Terputus</span>
			{/if}
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<h3>Ubah Password</h3>
		</div>
		<div class="card-body">
			<div class="form-group">
				<label for="current">Password Saat Ini</label>
				<input id="current" type="password" bind:value={currentPassword} placeholder="Masukkan password saat ini" />
			</div>
			<div class="form-group">
				<label for="new">Password Baru</label>
				<input id="new" type="password" bind:value={newPassword} placeholder="Password baru minimal 6 karakter" />
				<div class="hint">Minimal 6 karakter</div>
			</div>
			<div class="form-group">
				<label for="confirm">Konfirmasi Password Baru</label>
				<input id="confirm" type="password" bind:value={confirmPassword} placeholder="Ketik ulang password baru" />
			</div>
			<div class="actions">
				<button class="btn" onclick={handleChangePassword} disabled={loading}>Simpan Password</button>
			</div>
			{#if error}
				<div class="msg error">{error}</div>
			{/if}
			{#if success}
				<div class="msg success">{success}</div>
			{/if}
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<h3>Dokumentasi API</h3>
		</div>
		<div class="card-body">
			<p class="doc-lead">
				Semua endpoint expense tracker memakai header:
				<code>Authorization: Bearer &lt;token&gt;</code>
			</p>

			<div class="doc-section">
				<div class="doc-title">Laporan</div>
				<code class="endpoint">GET /api/expense-tracker/reports?start=YYYY-MM-DD&amp;end=YYYY-MM-DD&amp;format=json|csv|xlsx|pdf</code>
				<p class="doc-note">Format <code>json</code> untuk preview, <code>csv</code>/<code>xlsx</code>/<code>pdf</code> untuk unduhan. Hasilnya hanya total pengeluaran per bulan, mengikuti detail transaksi.</p>
			</div>

			<div class="doc-section">
				<div class="doc-title">Ringkasan</div>
				<code class="endpoint">GET /api/expense-tracker/summary?start=YYYY-MM-DD&amp;end=YYYY-MM-DD&amp;group_by=daily|monthly|yearly</code>
			</div>

			<div class="doc-section">
				<div class="doc-title">Detail transaksi</div>
				<code class="endpoint">GET /api/expense-tracker/detail?start=YYYY-MM-DD&amp;end=YYYY-MM-DD&amp;page=1&amp;limit=50&amp;sumber=...</code>
			</div>

			<div class="doc-section">
				<div class="doc-title">Top pengeluaran</div>
				<code class="endpoint">GET /api/expense-tracker/top-expenses?start=YYYY-MM-DD&amp;end=YYYY-MM-DD&amp;limit=10</code>
			</div>
		</div>
	</div>
</div>

<style>
	.pengaturan-page { }
	h2 { margin-bottom: 1rem; }
	.card {
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
		margin-bottom: 1rem;
		overflow: hidden;
	}
	.card-header {
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--border, #e5e7eb);
		background: #f9fafb;
	}
	.card-header h3 { margin: 0; font-size: 1rem; }
	.card-body { padding: 1.25rem; }
	.status {
		font-size: 0.9rem;
		font-weight: 600;
	}
	.status.connected { color: #16A34A; }
	.status.disconnected { color: #ef4444; }
	.status.loading { color: var(--text-muted, #6b7280); }
	.form-group { margin-bottom: 0.75rem; }
	.form-group label {
		display: block;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--text-muted, #6b7280);
		margin-bottom: 0.25rem;
	}
	.form-group input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 8px;
		font-size: 0.85rem;
		box-sizing: border-box;
	}
	.hint {
		font-size: 0.75rem;
		color: var(--text-muted, #6b7280);
		margin-top: 0.25rem;
	}
	.doc-lead {
		margin-bottom: 1rem;
		color: var(--text, #1a1a2e);
	}
	.doc-section {
		padding: 0.85rem 0;
		border-top: 1px solid var(--border, #e5e7eb);
	}
	.doc-section:first-of-type {
		border-top: none;
		padding-top: 0;
	}
	.doc-title {
		font-size: 0.85rem;
		font-weight: 700;
		margin-bottom: 0.35rem;
	}
	.endpoint {
		display: block;
		padding: 0.65rem 0.75rem;
		border-radius: 8px;
		background: #f8fafc;
		border: 1px solid var(--border, #e5e7eb);
		white-space: normal;
		word-break: break-word;
	}
	.doc-note {
		margin-top: 0.5rem;
		color: var(--text-muted, #6b7280);
		font-size: 0.85rem;
	}
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
	.btn:disabled { opacity: 0.5; }
	.msg {
		padding: 0.75rem;
		border-radius: 8px;
		margin-top: 0.75rem;
		font-size: 0.85rem;
	}
	.msg.error {
		background: #fef2f2;
		color: #c14141;
		border: 1px solid #fecaca;
	}
	.msg.success {
		background: #f0fdf4;
		color: #16A34A;
		border: 1px solid #b7ebcf;
	}
</style>
