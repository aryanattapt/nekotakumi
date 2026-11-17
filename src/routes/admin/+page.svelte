<div class="admin-welcome">
	<div class="content">
		<h1>👋 Welcome to the admin area</h1>
		<p class="subtitle">Choose a section from the sidebar to get started.</p>
		<div class="quick-links">
			<a href="/admin/expense-tracker/dashboard" class="quick-card">
				<span class="icon">📊</span>
				<span class="label">Expense Tracker dashboard</span>
			</a>
			<a href="/admin/expense-tracker/transaksi" class="quick-card">
				<span class="icon">📋</span>
				<span class="label">Transaction details</span>
			</a>
		</div>
	</div>
</div>

<style>
	.admin-welcome {
		display: flex;
		gap: 1.5rem;
		max-width: 1100px;
		margin: 0 auto;
		padding: 1rem 0;
	}

	.content {
		flex: 1;
		min-width: 0;
		padding: 1.5rem;
		border: 1px solid var(--border, #e6e8ef);
		border-radius: calc(var(--radius, 18px) * 1.25);
		background: var(--card);
		box-shadow: var(--shadow-soft, 0 12px 32px rgba(24, 32, 51, 0.07));
	}

	h1 {
		font-size: 1.5rem;
		font-size: clamp(1.5rem, 3vw, 2rem);
		letter-spacing: -0.045em;
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
		background: rgba(255, 255, 255, 0.86);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
		text-decoration: none;
		color: var(--text, #1a1a2e);
		font-weight: 500;
		transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
	}

	.quick-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		transform: translateY(-2px);
		border-color: rgba(109, 40, 217, 0.22);
		text-decoration: none;
	}

	.icon {
		font-size: 1.5rem;
	}

	@media (max-width: 900px) {
		.admin-welcome {
			padding-top: 0;
		}
		.content { padding: 1rem; }
	}
</style>
