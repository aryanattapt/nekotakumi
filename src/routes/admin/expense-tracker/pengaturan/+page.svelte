<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let dbStatus = $state(null);

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

	onMount(() => checkDB());
</script>

<div class="pengaturan-page">
	<header class="page-heading">
		<p class="eyebrow">Expense tracker</p>
		<h2>Settings</h2>
		<p>Check the connection and find the API details used by this tracker.</p>
	</header>

	<div class="card">
		<div class="card-header">
			<h3>Database connection</h3>
		</div>
		<div class="card-body">
			{#if dbStatus === null}
				<span class="status loading">Checking...</span>
			{:else if dbStatus === 'connected'}
				<span class="status connected">Connected</span>
			{:else}
				<span class="status disconnected">Disconnected</span>
			{/if}
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<h3>Password</h3>
		</div>
		<div class="card-body">
			<div class="notice">
				<span class="notice-icon" aria-hidden="true">i</span>
				<div>
					<strong>Password changes are unavailable here</strong>
					<p>The tracker uses a fixed server-side password. This screen will support password updates once persistent password storage is configured.</p>
				</div>
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<h3>API reference</h3>
		</div>
		<div class="card-body">
			<p class="doc-lead">
				Use this header for all expense tracker endpoints:
				<code>Authorization: Bearer &lt;token&gt;</code>
			</p>

			<div class="doc-section">
				<div class="doc-title">Reports</div>
				<code class="endpoint">GET /api/expense-tracker/reports?start=YYYY-MM-DD&amp;end=YYYY-MM-DD&amp;format=json|csv|xlsx|pdf</code>
				<p class="doc-note">Use <code>json</code> to preview or <code>csv</code>, <code>xlsx</code>, and <code>pdf</code> to download. Results show monthly expense totals based on transaction details.</p>
			</div>

			<div class="doc-section">
				<div class="doc-title">Summary</div>
				<code class="endpoint">GET /api/expense-tracker/summary?start=YYYY-MM-DD&amp;end=YYYY-MM-DD&amp;group_by=daily|monthly|yearly</code>
			</div>

			<div class="doc-section">
				<div class="doc-title">Transaction details</div>
				<code class="endpoint">GET /api/expense-tracker/detail?start=YYYY-MM-DD&amp;end=YYYY-MM-DD&amp;page=1&amp;limit=50&amp;sumber=...</code>
			</div>

			<div class="doc-section">
				<div class="doc-title">Top expenses</div>
				<code class="endpoint">GET /api/expense-tracker/top-expenses?start=YYYY-MM-DD&amp;end=YYYY-MM-DD&amp;limit=10</code>
			</div>
		</div>
	</div>
</div>

<style>
	.pengaturan-page { display: grid; gap: 1rem; }
	.page-heading { margin-bottom: 0.25rem; }
	.page-heading h2 { margin-bottom: 0.35rem; font-size: clamp(1.6rem, 3vw, 2rem); }
	.page-heading > p:last-child { color: var(--text-muted); }
	.eyebrow { color: var(--accent); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
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
		background: #ebe4d7;
	}
	.card-header h3 { margin: 0; font-size: 1rem; }
	.card-body { padding: 1.25rem; }
	.status {
		font-size: 0.9rem;
		font-weight: 600;
	}
	.status.connected { color: #15803d; }
	.status.disconnected { color: #ef4444; }
	.status.loading { color: var(--text-muted, #6b7280); }
	.notice { display: flex; gap: 0.85rem; align-items: flex-start; padding: 1rem; border: 1px solid #dbeafe; border-radius: 14px; background: #f5f9ff; }
	.notice-icon { display: grid; place-items: center; width: 1.5rem; height: 1.5rem; flex: 0 0 auto; border-radius: 50%; color: #fff; background: var(--cobalt); font-weight: 800; font-family: Georgia, serif; }
	.notice strong { display: block; margin-bottom: 0.2rem; }
	.notice p { color: var(--text-muted); font-size: 0.88rem; }
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
</style>
