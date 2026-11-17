<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import FloatingActions from '$lib/components/FloatingActions.svelte';
	import { defaultDescription, defaultLocale, siteName } from '$lib/seo';

	let { children } = $props();
	let isAdmin = $derived(page.url.pathname.startsWith('/admin'));
	let menuOpen = $state(false);
	let newsOpen = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
		newsOpen = false;
	}
</script>

<svelte:head>
	<meta name="application-name" content={siteName} />
	<meta name="author" content="Arya" />
	<meta name="robots" content={isAdmin ? 'noindex, nofollow' : 'index, follow'} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:locale" content={defaultLocale} />
	<meta property="og:description" content={defaultDescription} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{#if isAdmin}
	{@render children()}
{:else}
	<div class="layout">
		<header class="header">
			<div class="header-inner">
				<a href="/" class="logo" aria-label="Nekotakumi Labs home">
					<span class="logo-mark">n.</span><span>Nekotakumi <em>Labs</em></span>
				</a>
				<button class="hamburger" onclick={toggleMenu} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen}>
					<span class:open={menuOpen}></span><span class:open={menuOpen}></span><span class:open={menuOpen}></span>
				</button>
				<nav class:open={menuOpen} aria-label="Main navigation">
					<a href="/#experiments" onclick={closeMenu}>Experiments</a>
					<a href="/blog" class:active={page.url.pathname.startsWith('/blog')} onclick={closeMenu}>Blog</a>
					<div class="news-menu">
						<button class:active={page.url.pathname.startsWith('/tech-news') || page.url.pathname.startsWith('/astronomy-news')} type="button" aria-haspopup="true" aria-expanded={newsOpen} onclick={() => newsOpen = !newsOpen}>News <span aria-hidden="true">⌄</span></button>
						<div class:open={newsOpen} class="news-dropdown">
							<a href="/tech-news" onclick={closeMenu}>Tech News</a>
							<a href="/astronomy-news" onclick={closeMenu}>Astronomy News</a>
						</div>
					</div>
					<a href="/ihsg" class:active={page.url.pathname.startsWith('/ihsg')} onclick={closeMenu}>IHSG</a>
					<a href="/tentang" class:active={page.url.pathname.startsWith('/tentang')} onclick={closeMenu}>About</a>
					<a class="github-link" href="https://github.com/aryanattapt" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
				</nav>
			</div>
		</header>

		<main>{@render children()}</main>
		<FloatingActions />

		<footer class="footer">
			<div class="footer-inner">
				<a class="footer-brand" href="/">Nekotakumi Labs</a>
				<p>Small experiments, useful lessons, and the occasional happy accident.</p>
				<div class="footer-links">
					<a href="/blog">Blog</a><a href="/tech-news">Tech News</a><a href="/astronomy-news">Astronomy News</a>
					<a href="/ihsg">IHSG</a><a href="/tentang">About</a>
				</div>
				<small>Made with curiosity by Arya · {new Date().getFullYear()}</small>
			</div>
		</footer>
	</div>
{/if}

<style>
	.layout { display: flex; flex-direction: column; min-height: 100vh; }
	.header { position: sticky; top: 0; z-index: 20; background: rgba(247, 248, 252, 0.9); border-bottom: 1px solid var(--border); backdrop-filter: blur(14px); }
	.header-inner { max-width: 1280px; margin: 0 auto; padding: 0.8rem 1.4rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
	.logo { display: inline-flex; align-items: center; gap: 0.55rem; color: var(--text) !important; font-size: 1.08rem; font-weight: 700; letter-spacing: -0.025em; white-space: nowrap; }
	.logo em { color: var(--accent); font-style: normal; }
	.logo-mark { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: 0.7rem; background: var(--accent); color: white; font: 700 1.18rem 'Space Grotesk', sans-serif; letter-spacing: -0.08em; box-shadow: 0 5px 14px rgba(109, 40, 217, 0.2); }
	.hamburger { display: none; flex-direction: column; gap: 5px; padding: 0.5rem; background: transparent; border: 0; border-radius: 0.7rem; cursor: pointer; }
	.hamburger span { display: block; width: 23px; height: 2px; background: var(--text); border-radius: 2px; transition: transform 180ms ease, opacity 180ms ease; }
	.hamburger span.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
	.hamburger span.open:nth-child(2) { opacity: 0; }
	.hamburger span.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
	nav { display: flex; align-items: center; gap: 0.3rem; }
	nav > a, .news-menu > button { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.55rem 0.72rem; border: 0; border-radius: 999px; background: transparent; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; white-space: nowrap; cursor: pointer; transition: color 180ms ease, background 180ms ease; }
	nav > a:hover, .news-menu > button:hover, nav > a.active, .news-menu > button.active { background: var(--accent-soft); color: var(--accent); text-decoration: none; }
	.news-menu { position: relative; }
	.news-dropdown { position: absolute; top: calc(100% + 0.45rem); left: 0; z-index: 30; min-width: 190px; padding: 0.4rem; border: 1px solid var(--border); border-radius: 1rem; background: white; box-shadow: var(--shadow-soft); opacity: 0; visibility: hidden; transform: translateY(5px); transition: opacity 160ms ease, transform 160ms ease, visibility 160ms ease; }
	.news-menu:hover .news-dropdown, .news-menu:focus-within .news-dropdown, .news-dropdown.open { opacity: 1; visibility: visible; transform: translateY(0); }
	.news-dropdown a { display: block; padding: 0.65rem 0.75rem; border-radius: 0.7rem; color: var(--text); font-size: 0.88rem; }
	.news-dropdown a:hover { background: #f6f3fc; text-decoration: none; }
	.github-link span { color: var(--accent); }
	main { flex: 1; }
	.footer { margin-top: 4rem; padding: 2.7rem 1.25rem 1.4rem; border-top: 1px solid var(--border); background: white; color: var(--text-muted); }
	.footer-inner { display: grid; gap: 0.5rem; width: min(100%, 1160px); margin: 0 auto; }
	.footer-brand { color: var(--text); font: 700 1rem 'Space Grotesk', sans-serif; }
	.footer-inner p { font-size: 0.9rem; }
	.footer-links { display: flex; flex-wrap: wrap; gap: 0.35rem 1.1rem; margin: 0.6rem 0 0.8rem; }
	.footer-links a { color: var(--text-muted); font-size: 0.85rem; }
	.footer-links a:hover { color: var(--accent); }
	.footer-inner small { border-top: 1px solid var(--border); padding-top: 1rem; font-size: 0.78rem; }
	@media (max-width: 900px) and (min-width: 641px) { .header-inner { padding-inline: 1rem; } nav > a, .news-menu > button { padding-inline: 0.48rem; font-size: 0.77rem; } }
	@media (max-width: 640px) {
		.header-inner { padding: 0.75rem 1rem; flex-wrap: wrap; }
		.hamburger { display: flex; }
		nav { display: none; flex-direction: column; align-items: stretch; gap: 0.45rem; width: 100%; padding: 0.4rem 0 0.5rem; }
		nav.open { display: flex; animation: rise-in 180ms ease both; }
		nav > a, .news-menu > button { display: flex; width: 100%; justify-content: space-between; padding: 0.72rem 0.85rem; border-radius: 0.8rem; background: #f4f2f9; font-size: 0.96rem; }
		.news-dropdown { position: static; display: none; margin: 0.35rem 0 0 0.7rem; box-shadow: none; opacity: 1; visibility: visible; transform: none; }
		.news-dropdown.open, .news-menu:hover .news-dropdown, .news-menu:focus-within .news-dropdown { display: block; }
		.github-link { justify-content: center !important; }
		.footer { margin-top: 3rem; padding: 2rem 1rem 1.2rem; }
	}
</style>
