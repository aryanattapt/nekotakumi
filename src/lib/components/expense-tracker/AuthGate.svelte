<script lang="ts">
	let { onLogin }: { onLogin: (token: string) => void } = $props();

	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/admin/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});
			const data = await res.json();
			if (data.ok && data.token) {
				onLogin(data.token);
			} else {
				error = data.error || 'Could not sign in';
			}
		} catch (e) {
			error = 'Could not connect to the server';
		} finally {
			loading = false;
		}
	}
</script>

<div class="auth-gate">
	<div class="auth-card">
		<h2>🔒 Expense Tracker</h2>
		<p class="subtitle">Enter your password to continue</p>
		<form onsubmit={handleSubmit}>
			<input
				type="password"
				placeholder="Password"
				bind:value={password}
				disabled={loading}
				autofocus
			/>
			{#if error}
				<div class="error">{error}</div>
			{/if}
			<button type="submit" disabled={loading || !password}>
				{loading ? 'Signing in...' : 'Sign in'}
			</button>
		</form>
	</div>
</div>

<style>
	.auth-gate {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 60vh;
	}
	.auth-card {
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
		background: var(--accent, #2f7d4a);
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
		background: var(--accent-hover, #1f5a35);
	}
	.error {
		color: #ef4444;
		font-size: 0.85rem;
		margin-bottom: 0.75rem;
	}
</style>
