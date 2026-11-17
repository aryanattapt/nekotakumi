<script lang="ts">
	let { children } = $props();
</script>

<div class="expense-shell">
	<div class="top-bar">
		<div>
			<p class="eyebrow">Personal workspace</p>
			<h1>Expense Tracker</h1>
		</div>
		<span class="workspace-badge"><i></i> Private dashboard</span>
	</div>
	{@render children()}
</div>

<style>
	.expense-shell {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}
	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.2rem;
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) * 1.1);
		background: linear-gradient(115deg, rgba(237, 232, 255, 0.85), rgba(238, 249, 255, 0.8) 62%, rgba(255, 255, 255, 0.86));
		box-shadow: 0 12px 28px rgba(24, 32, 51, 0.045);
	}
	.top-bar h1 {
		font-size: clamp(1.25rem, 2.5vw, 1.55rem);
		line-height: 1.15;
	}
	.eyebrow { color: var(--accent); font-size: 0.66rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; }
	.workspace-badge { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.45rem 0.7rem; border: 1px solid rgba(255,255,255,.9); border-radius: 999px; background: rgba(255,255,255,.65); color: var(--text-muted); font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
	.workspace-badge i { width: 0.45rem; height: 0.45rem; border-radius: 50%; background: #31aa78; box-shadow: 0 0 0 3px rgba(49, 170, 120, 0.12); }
	@media (max-width: 520px) { .top-bar { align-items: flex-start; flex-direction: column; } }
</style>
