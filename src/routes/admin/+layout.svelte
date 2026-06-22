<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

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
				fetch('/api/expense-tracker/auth', {
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
			const res = await fetch('/api/expense-tracker/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});
			const data = await res.json();
			if (data.ok && data.token) {
				token = data.token;
				if (browser) localStorage.setItem('expense_token', data.token);
			} else {
				error = data.error || 'Login gagal';
			}
		} catch (e) {
			error = 'Gagal terhubung ke server';
		} finally {
			loginLoading = false;
		}
	}

	function handleLogout() {
		token = null;
		if (browser) localStorage.removeItem('expense_token');
	}
</script>

{#if loading}
	<div class="loading">Memuat...</div>
{:else if !token}
	<div class="login-page">
		<div class="login-card">
			<h2>🔒 Admin Area</h2>
			<p class="subtitle">Masukkan password untuk mengakses</p>
			<form onsubmit={handleLogin}>
				<input
					type="password"
					placeholder="Password"
					bind:value={password}
					disabled={loginLoading}
					autofocus
				/>
				{#if error}
					<div class="error">{error}</div>
				{/if}
				<button type="submit" disabled={loginLoading || !password}>
					{loginLoading ? 'Memproses...' : 'Masuk'}
				</button>
			</form>
		</div>
	</div>
{:else}
	{@render children()}
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
		min-height: 60vh;
	}
	.login-card {
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
		padding: 2rem;
		width: 100%;
		max-width: 360px;
		text-align: center;
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
	}
	.error {
		color: #ef4444;
		font-size: 0.85rem;
		margin-bottom: 0.75rem;
	}
</style>
