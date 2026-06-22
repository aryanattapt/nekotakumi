<script lang="ts">
	import { page } from '$app/state';
	import AdminSidebar from '$lib/components/expense-tracker/AdminSidebar.svelte';

	let currentPath = $derived(page.url.pathname);
</script>

<div class="admin-welcome">
	<AdminSidebar {currentPath} />
	<main class="content">
		<h1>👋 Selamat Datang di Admin Area</h1>
		<p class="subtitle">Pilih menu di sidebar untuk mulai.</p>
		<div class="quick-links">
			<a href="/admin/expense-tracker/dashboard" class="quick-card">
				<span class="icon">📊</span>
				<span class="label">Expense Tracker Dashboard</span>
			</a>
			<a href="/admin/expense-tracker/transaksi" class="quick-card">
				<span class="icon">📋</span>
				<span class="label">Detail Transaksi</span>
			</a>
		</div>
	</main>
</div>

<style>
	.admin-welcome {
		display: flex;
		gap: 1.5rem;
		max-width: 1100px;
		margin: 0 auto;
		padding: 1rem;
	}
	.content {
		flex: 1;
		min-width: 0;
	}
	h1 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: var(--text-muted, #6b7280);
		margin-bottom: 2rem;
	}
	.quick-links {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.quick-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
		text-decoration: none;
		color: var(--text, #1a1a2e);
		font-weight: 500;
		transition: box-shadow 0.2s, transform 0.2s;
	}
	.quick-card:hover {
		box-shadow: 0 4px 12px rgba(0,0,0,0.08);
		transform: translateY(-2px);
		text-decoration: none;
	}
	.icon {
		font-size: 1.5rem;
	}
</style>
