<script lang="ts">
	let { currentPath = '/admin/expense-tracker/dashboard' }: { currentPath?: string } = $props();

	const menuItems = [
		{ href: '/admin/expense-tracker/dashboard', label: '\ud83d\udcca Dashboard' },
		{ href: '/admin/expense-tracker/transaksi', label: '\ud83d\udccb Transaksi' },
		{ href: '/admin/expense-tracker/kategori', label: '\ud83d\udcc2 Kategori' },
		{ href: '/admin/expense-tracker/budget', label: '\ud83d\udcb0 Budget' },
		{ href: '/admin/expense-tracker/laporan', label: '\ud83d\udcc4 Laporan' },
		{ href: '/admin/expense-tracker/pengaturan', label: '\u2699\ufe0f Pengaturan' },
	];

	function isActive(href: string) {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<aside class="sidebar">
	<nav>
		{#each menuItems as item}
			<a
				href={item.href}
				class:active={isActive(item.href)}
			>
				<span class="label">{item.label}</span>
			</a>
		{/each}
	</nav>
</aside>

<style>
	.sidebar {
		width: 220px;
		flex-shrink: 0;
		padding: 1rem 0;
	}
	nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	a {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1rem;
		border-radius: 8px;
		color: var(--text, #1a1a2e);
		text-decoration: none;
		font-size: 0.9rem;
		transition: background 0.15s;
	}
	a:hover {
		background: #f3f4f6;
		text-decoration: none;
	}
	a.active {
		background: var(--accent, #7c3aed);
		color: #fff;
		font-weight: 600;
	}
</style>
