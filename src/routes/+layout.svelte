<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	let { children } = $props();

	let isAdmin = $derived(page.url.pathname.startsWith('/admin'));
	let menuOpen = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

{#if isAdmin}
	{@render children()}
{:else}
	<div class="layout" >
		<header class="header">
			<div class="header-inner">
				<a href="/" class="logo">Nekotakumi</a>
				<button class="hamburger" onclick={toggleMenu} aria-label="Toggle menu">
					<span class:open={menuOpen}></span>
					<span class:open={menuOpen}></span>
					<span class:open={menuOpen}></span>
				</button>
				<nav class:open={menuOpen}>
					<a href="/" onclick={closeMenu}>Blog</a>
					<a href="/tech-news" onclick={closeMenu}>Tech News</a>
					<!-- <a href="/astronomy-news" onclick={closeMenu}>Astronomy News</a> -->
					<a href="/ihsg" onclick={closeMenu}>IHSG</a>
					<a href="/tentang" onclick={closeMenu}>Tentang</a>
				</nav>
			</div>
		</header>

		<main>
			{@render children()}
		</main>

		<footer class="footer">
			<p>Nekotakumi &copy; {new Date().getFullYear()}</p>
		</footer>
	</div>
{/if}

<style>
	.layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.header {
		background: var(--bg-card);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: 10;
		backdrop-filter: blur(8px);
		background: rgba(255,255,255,0.9);
	}

	.header-inner {
		max-width: var(--max-w);
		margin: 0 auto;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.logo {
		font-weight: 700;
		font-size: 1.25rem;
		color: var(--text) !important;
	}

	/* Hamburger */
	.hamburger {
		display: none;
		flex-direction: column;
		gap: 5px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		z-index: 20;
	}

	.hamburger span {
		display: block;
		width: 24px;
		height: 2px;
		background: var(--text);
		border-radius: 2px;
		transition: transform 0.3s, opacity 0.3s;
	}

	.hamburger span.open:nth-child(1) {
		transform: translateY(7px) rotate(45deg);
	}

	.hamburger span.open:nth-child(2) {
		opacity: 0;
	}

	.hamburger span.open:nth-child(3) {
		transform: translateY(-7px) rotate(-45deg);
	}

	nav {
		display: flex;
		gap: 1.5rem;
	}

	nav a {
		font-size: 0.9rem;
		font-weight: 500;
	}

	/* Mobile */
	@media (max-width: 640px) {
		.hamburger {
			display: flex;
		}

		nav {
			display: none;
			flex-direction: column;
			width: 100%;
			padding: 1rem 0 0;
			gap: 0.75rem;
		}

		nav.open {
			display: flex;
		}

		nav a {
			padding: 0.5rem 0;
			font-size: 1rem;
		}
	}

	main {
		flex: 1;
	}

	.footer {
		text-align: center;
		padding: 2rem 1rem;
		color: var(--text-muted);
		font-size: 0.85rem;
		border-top: 1px solid var(--border);
		margin-top: 3rem;
	}
</style>
