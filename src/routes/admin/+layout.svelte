<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Sidebar from '$lib/components/expense-tracker/Sidebar.svelte';
	import FloatingActions from '$lib/components/FloatingActions.svelte';

	let { children } = $props();

	let token = $state<string | null>(null);
	let loading = $state(true);
	let password = $state('');
	let error = $state('');
	let loginLoading = $state(false);

	onMount(() => {
		if (browser) {
			const stored = localStorage.getItem('expense_token');
			if (stored) {
				fetch('/api/admin/auth/login', {
					headers: { 'Authorization': `Bearer ${stored}` }
				})
				.then(res => {
					if (res.ok) {
						token = stored;
					} else {
						localStorage.removeItem('expense_token');
					}
				})
				.catch(() => {})
				.finally(() => { loading = false; });
			} else {
				loading = false;
			}
		}
	});

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loginLoading = true;

		try {
			const res = await fetch('/api/admin/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});
			const data = await res.json();
			if (data.ok && data.token) {
				token = data.token;
				if (browser) localStorage.setItem('expense_token', data.token);
			} else {
				error = data.error || 'Could not sign in';
			}
		} catch (e) {
			error = 'Could not connect to the server';
		} finally {
			loginLoading = false;
		}
	}

	async function handleLogout() {
		token = null;
		if (browser) localStorage.removeItem('expense_token');
		await goto('/admin', { replaceState: true, noScroll: true });
	}
</script>

{#if loading}
	<div class="loading">Loading...</div>
{:else if !token}
	<div class="login-page">
		<div class="login-card">
			<h2>🔒 Admin Area</h2>
			<p class="subtitle">Enter your password to continue</p>
			<form onsubmit={handleLogin}>
				<input
					type="password"
					placeholder="Password"
					bind:value={password}
					disabled={loginLoading}
				/>
				{#if error}
					<div class="error">{error}</div>
				{/if}
				<button type="submit" disabled={loginLoading || !password}>
					{loginLoading ? 'Signing in...' : 'Sign in'}
				</button>
			</form>
		</div>
	</div>
	{:else}
		<div class="admin-shell">
		<Sidebar currentPath={page.url.pathname} onLogout={handleLogout} />
			<main class="content">
				{@render children()}
			</main>
		</div>
	<FloatingActions />
{/if}

<style>
	.loading {
		text-align: center;
		padding: 3rem;
		color: var(--text-muted, #6b7280);
	}
	.login-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 68vh;
		padding: 1rem;
		background: radial-gradient(ellipse at 50% 35%, rgba(196, 181, 253, 0.2), transparent 27rem);
	}
	.login-card {
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
		padding: 2rem;
		width: 100%;
		max-width: 360px;
		text-align: center;
		box-shadow: 0 24px 70px rgba(24, 32, 51, 0.11);
		animation: rise-in 420ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
	}
	h2 {
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: var(--text-muted, #6b7280);
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}
	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 8px;
		font-size: 1rem;
		margin-bottom: 0.75rem;
		box-sizing: border-box;
	}
	button {
		width: 100%;
		padding: 0.75rem;
		background: var(--accent, #7c3aed);
		color: #fff;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	button:hover:not(:disabled) {
		background: var(--accent-hover, #6d28d9);
		transform: translateY(-1px);
		box-shadow: 0 9px 22px rgba(109, 40, 217, 0.22);
	}
	.error {
		color: #ef4444;
		font-size: 0.85rem;
		margin-bottom: 0.75rem;
	}

	.admin-shell {
		display: flex;
		gap: 1.5rem;
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
		align-items: flex-start;
	}

	.content {
		flex: 1;
		min-width: 0;
	}

	@media (max-width: 900px) {
		.admin-shell {
			flex-direction: column;
		}
	}
</style>
