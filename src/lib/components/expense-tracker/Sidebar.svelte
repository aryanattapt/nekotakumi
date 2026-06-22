<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let {
		currentPath = "/admin/expense-tracker/dashboard",
		onLogout
	}: {
		currentPath?: string;
		onLogout?: () => void | Promise<void>;
	} = $props();

	let submenuOpen = $state(false);

	$effect(() => {
		if (currentPath.startsWith("/admin/expense-tracker")) {
			submenuOpen = true;
		}
	});

	function isActive(href: string) {
		return currentPath === href || currentPath.startsWith(href + "/");
	}

	function toggleExpenseTracker() {
		submenuOpen = !submenuOpen;
	}

	async function handleLogout() {
		if (onLogout) {
			await onLogout();
			return;
		}

		if (browser) {
			localStorage.removeItem('expense_token');
		}
		await goto('/admin', { replaceState: true, noScroll: true });
	}
</script>

<aside class="sidebar">
	<nav class="nav">
		<div class="group">
			<button
				type="button"
				class="group-header"
				aria-expanded={submenuOpen}
				onclick={toggleExpenseTracker}
			>
				<span>Expense Tracker</span>
				<span class="chevron" class:open={submenuOpen}>▾</span>
			</button>

			{#if submenuOpen}
				<div class="submenu">
					<a href="/admin/expense-tracker/dashboard" class:active={isActive("/admin/expense-tracker/dashboard")}>
						<span class="label">Dashboard</span>
					</a>
					<a href="/admin/expense-tracker/transaksi" class:active={isActive("/admin/expense-tracker/transaksi")}>
						<span class="label">Transaksi</span>
					</a>
					<a href="/admin/expense-tracker/kategori" class:active={isActive("/admin/expense-tracker/kategori")}>
						<span class="label">Kategori</span>
					</a>
					<a href="/admin/expense-tracker/budget" class:active={isActive("/admin/expense-tracker/budget")}>
						<span class="label">Budget</span>
					</a>
					<a href="/admin/expense-tracker/laporan" class:active={isActive("/admin/expense-tracker/laporan")}>
						<span class="label">Laporan</span>
					</a>
				</div>
			{/if}
		</div>

		<div class="group separated">
			<a href="/admin/expense-tracker/pengaturan" class:active={isActive("/admin/expense-tracker/pengaturan")}>
				<span class="label">Pengaturan</span>
			</a>

			<button type="button" class="logout" onclick={handleLogout}>
				<span class="label">Log out</span>
			</button>
		</div>
	</nav>
</aside>

<style>
	.sidebar {
		width: 260px;
		flex-shrink: 0;
		padding: 1rem 0;
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) * 1.1);
		background: rgba(255, 255, 255, 0.75);
	}

	.group.separated {
		padding-top: 0.5rem;
	}

	.group-header,
	a,
	.logout {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		width: 100%;
		padding: 0.7rem 0.85rem;
		border: 1px solid transparent;
		border-radius: 0.85rem;
		color: var(--text);
		text-decoration: none;
		font-size: 0.92rem;
		transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
	}

	.group-header {
		background: rgba(37, 99, 235, 0.05);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		cursor: pointer;
	}

	.group-header:hover,
	a:hover,
	.logout:hover {
		background: rgba(37, 99, 235, 0.08);
		text-decoration: none;
		transform: translateY(-1px);
	}

	.submenu {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding-left: 0.2rem;
	}

	.submenu a {
		padding-left: 1rem;
		background: rgba(255, 255, 255, 0.8);
	}

	a.active {
		background: var(--accent);
		color: white;
		font-weight: 700;
	}

	.logout {
		background: rgba(239, 68, 68, 0.06);
		border-color: rgba(239, 68, 68, 0.15);
		cursor: pointer;
		font-weight: 700;
		color: #b91c1c;
	}

	.chevron {
		transition: transform 0.15s ease;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	@media (max-width: 900px) {
		.sidebar {
			width: 100%;
		}
	}
</style>
