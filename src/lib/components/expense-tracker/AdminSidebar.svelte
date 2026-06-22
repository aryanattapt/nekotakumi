<script lang="ts">
	let { currentPath = '/admin' }: { currentPath?: string } = $props();

	const menuItems = [
		{
			header: 'Expense Tracker',
			href: '/admin/expense-tracker/dashboard',
			children: [
				{ href: '/admin/expense-tracker/dashboard', label: '📊 Dashboard' },
				{ href: '/admin/expense-tracker/transaksi', label: '📋 Transaksi' },
				{ href: '/admin/expense-tracker/kategori', label: '📂 Kategori', future: true },
				{ href: '/admin/expense-tracker/budget', label: '💰 Budget', future: true },
				{ href: '/admin/expense-tracker/laporan', label: '📄 Laporan', future: true },
				{ href: '/admin/expense-tracker/pengaturan', label: '⚙️ Pengaturan', future: true },
			]
		}
	];

	function isActive(href: string) {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<aside class="sidebar">
	<nav>
		{#each menuItems as group}
			<div class="menu-group">
				<a href={group.href} class="group-header" class:active={isActive(group.href)}>
					{group.header}
				</a>
				{#each group.children as item}
					<a
						href={item.href}
						class:active={isActive(item.href)}
						class:future={item.future}
					>
						<span class="label">{item.label}</span>
						{#if item.future}
							<span class="badge">Soon</span>
						{/if}
					</a>
				{/each}
			</div>
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
		gap: 0.5rem;
	}
	.menu-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.group-header {
		display: flex;
		align-items: center;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		color: var(--text, #1a1a2e);
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted, #6b7280);
	}
	.group-header:hover {
		background: #f3f4f6;
		text-decoration: none;
	}
	.group-header.active {
		color: var(--accent, #7c3aed);
	}
	a {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1rem 0.6rem 1.5rem;
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
	a.future {
		opacity: 0.6;
	}
	.badge {
		font-size: 0.65rem;
		background: #e5e7eb;
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		color: var(--text-muted, #6b7280);
		margin-left: auto;
	}
	a.active .badge {
		background: rgba(255,255,255,0.2);
		color: #fff;
	}
</style>
