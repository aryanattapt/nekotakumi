<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { canonicalUrl, jsonLd, ogImageUrl, siteName } from "$lib/seo";
	import { onDestroy } from "svelte";

	let { data } = $props();

	let loading = $state(false);
	let searchInput = $state("");
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		searchInput = data.q;
	});

	function buildUrl(nextPage: number, nextQuery = searchInput) {
		const next = new URL(page.url);
		const query = nextQuery.trim();

		if (query) {
			next.searchParams.set("q", query);
		} else {
			next.searchParams.delete("q");
		}

		if (nextPage > 1) {
			next.searchParams.set("page", String(nextPage));
		} else {
			next.searchParams.delete("page");
		}

		return next;
	}

	async function goTo(nextPage: number, nextQuery = searchInput) {
		loading = true;
		try {
			await goto(buildUrl(nextPage, nextQuery), {
				replaceState: true,
				noScroll: true
			});
		} finally {
			loading = false;
		}
	}

	function onInput(event: Event) {
		searchInput = (event.target as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => goTo(1, searchInput), 280);
	}

	function clearSearch() {
		searchInput = "";
		goTo(1, "");
	}

	function getPageWindow(current: number, total: number) {
		if (total <= 1) return [];

		const start = Math.max(1, current - 2);
		const end = Math.min(total, current + 2);
		const pages = [];

		for (let p = start; p <= end; p += 1) {
			pages.push(p);
		}

		return pages;
	}

	onDestroy(() => clearTimeout(debounceTimer));
</script>

<svelte:head>
	<title>Tech News — Nekotakumi Labs</title>
	<meta name="description" content="A readable feed of technology news from across the web, curated for curious minds." />
	<meta name="robots" content="noindex, follow" />
	<link rel="canonical" href={canonicalUrl(page.url, "/tech-news")} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Tech News — Nekotakumi Labs" />
	<meta property="og:description" content="A readable feed of technology news from across the web, curated for curious minds." />
	<meta property="og:url" content={canonicalUrl(page.url, "/tech-news")} />
	<meta property="og:image" content={ogImageUrl(page.url)} />
	<meta name="twitter:title" content="Tech News — Nekotakumi Labs" />
	<meta name="twitter:description" content="A readable feed of technology news from across the web, curated for curious minds." />
	<meta name="twitter:image" content={ogImageUrl(page.url)} />
	<script type="application/ld+json">
		{jsonLd({
			"@context": "https://schema.org",
			"@type": "CollectionPage",
			name: "Tech News — Nekotakumi Labs",
			url: canonicalUrl(page.url, "/tech-news"),
			description: "A readable feed of technology news from across the web, curated for curious minds.",
			isPartOf: {
				"@type": "WebSite",
				name: siteName,
				url: canonicalUrl(page.url, "/")
			}
		})}
	</script>
</svelte:head>

<div class="page-shell">
	<section class="hero">
		<div class="hero-copy">
			<p class="eyebrow">Tech news</p>
			<h1>Technology, lately.</h1>
			<p class="subtitle">Stories and ideas shaping the way we build, use, and think about technology.</p>
		</div>

		<div class="hero-stats">
			<div class="stat">
				<span class="stat-label">Stories</span>
				<strong>{data.total}</strong>
			</div>
			<div class="stat">
				<span class="stat-label">Pages</span>
				<strong>{data.totalPages || 0}</strong>
			</div>
		</div>
	</section>

	<section class="related-links" aria-label="More from Nekotakumi Labs">
		<a href="/blog">The blog</a>
		<a href="/astronomy-news">Astronomy news</a>
		<a href="/ihsg">IHSG</a>
	</section>

	<section class="toolbar">
		<label class="search">
			<span>Search stories</span>
			<input
				type="search"
				placeholder="Topic, title, or excerpt..."
				value={searchInput}
				oninput={onInput}
			/>
		</label>

		{#if data.q}
			<button class="ghost-button" type="button" onclick={clearSearch} disabled={loading}>
				Clear search
			</button>
		{/if}
	</section>

	{#if data.q}
		<p class="search-info">Showing results for <strong>{data.q}</strong>. {data.total} stories found.</p>
	{/if}

	{#if loading}
		<div class="state-card">Loading the latest stories...</div>
	{:else if data.items.length === 0}
		<div class="state-card empty">{data.q ? "No stories match that search." : "No technology stories have been added yet."}</div>
	{:else}
		<div class="posts">
			{#each data.items as item}
				<article class="post-card">
					<div class="post-topline">
						{#if item.sourceName}
							<span class="pill">{item.sourceName}</span>
						{:else}
							<span class="pill alt">Tech</span>
						{/if}
						<time>{new Date(item.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
					</div>
					<h2><a href={"/tech-news/" + item.slug}>{item.title}</a></h2>
					{#if item.excerpt}<p class="excerpt">{item.excerpt}</p>{/if}
					<div class="actions">
						<a class="read-more" href={"/tech-news/" + item.slug}>Read story</a>
						{#if item.sourceUrl}
							<a class="source-link" href={item.sourceUrl} target="_blank" rel="noopener">Original source</a>
						{/if}
					</div>
				</article>
			{/each}
		</div>

		{#if data.totalPages > 1}
			<nav class="pagination" aria-label="Technology news pagination">
				<button type="button" class="page-step" disabled={loading || data.page <= 1} onclick={() => goTo(data.page - 1)}>Previous</button>

				<div class="page-numbers">
					{#each getPageWindow(data.page, data.totalPages) as currentPage}
						<button
							type="button"
							class:active={currentPage === data.page}
							class="page-number"
							disabled={loading}
							onclick={() => goTo(currentPage)}
						>
							{currentPage}
						</button>
					{/each}
				</div>

				<button type="button" class="page-step" disabled={loading || data.page >= data.totalPages} onclick={() => goTo(data.page + 1)}>Next</button>
			</nav>
		{/if}
	{/if}
</div>

<style>
	.page-shell {
		max-width: 1080px;
		margin: 0 auto;
		padding: 1.25rem 1rem 3rem;
	}

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1.25rem;
		align-items: end;
		padding: 2rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--card);
		box-shadow: 0 24px 60px rgba(15, 23, 42, 0.06);
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		font-size: 12px;
		color: var(--accent-hover);
		font-weight: 700;
		margin-bottom: 0.75rem;
	}

	h1 {
		font-size: clamp(2.1rem, 4vw, 3.6rem);
		line-height: 1;
		margin-bottom: 0.75rem;
	}

	.subtitle {
		max-width: 58ch;
		color: var(--text-muted);
		font-size: 1.02rem;
	}

	.hero-stats {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.stat {
		min-width: 110px;
		padding: 0.95rem 1rem;
		border-radius: 1rem;
		background: var(--card);
		border: 1px solid var(--border);
	}

	.stat-label {
		display: block;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		margin-bottom: 0.25rem;
	}

	.stat strong {
		font-size: 1.35rem;
		line-height: 1;
	}

	.toolbar {
		display: flex;
		gap: 0.75rem;
		align-items: end;
		margin: 1.25rem 0 0.75rem;
		flex-wrap: wrap;
	}

	.search {
		flex: 1;
		display: grid;
		gap: 0.45rem;
		min-width: min(100%, 320px);
	}

	.search span {
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.search input {
		width: 100%;
		padding: 0.9rem 1rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
		color: var(--text);
		font-size: 1rem;
		box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
	}

	.search input:focus {
		outline: 2px solid color-mix(in srgb, var(--accent) 20%, transparent);
		border-color: color-mix(in srgb, var(--accent) 45%, white);
	}

	.ghost-button,
	.page-step,
	.page-number,
	.source-link {
		border: 1px solid var(--border);
		background: var(--card);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.8rem 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform var(--duration-ui) var(--ease-spring);
	}

	.ghost-button:hover,
	.page-step:hover,
	.page-number:hover,
	.source-link:hover {
		transform: translateY(-1px);
		text-decoration: none;
	}

	.ghost-button:disabled,
	.page-step:disabled,
	.page-number:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.search-info {
		color: var(--text-muted);
		margin: 0.5rem 0 1rem;
	}

	.state-card {
		padding: 2rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--card);
		text-align: center;
		color: var(--text-muted);
	}

	.posts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		margin-top: 0.75rem;
	}

	.post-card {
		padding: 1.3rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--card);
		box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
		transition: transform var(--duration-ui) var(--ease-spring);
	}

	.post-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 22px 44px rgba(15, 23, 42, 0.09);
	}

	.post-topline {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
		color: var(--text-muted);
		font-size: 0.82rem;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		padding: 0.32rem 0.7rem;
		border-radius: var(--radius);
		background: var(--sprout);
		color: var(--accent-hover);
		font-size: 12px;
		font-weight: 700;
	}

	.pill.alt {
		background: var(--sprout);
		color: var(--accent-hover);
	}

	h2 {
		margin-bottom: 0.55rem;
		font-size: clamp(1.1rem, 2vw, 1.45rem);
		line-height: 1.3;
	}

	h2 a {
		color: var(--text);
	}

	h2 a:hover {
		color: var(--accent-hover);
		text-decoration: none;
	}

	.excerpt {
		color: var(--text-muted);
		margin-bottom: 1rem;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.read-more {
		font-weight: 700;
	}

	.source-link {
		padding: 0.7rem 0.95rem;
		font-size: 0.9rem;
	}

	.pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 1.4rem;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 1.1rem;
		background: var(--card);
	}

	.related-links {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin: 1rem 0 0.25rem;
	}

	.related-links a {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.7rem 0.95rem;
		background: var(--card);
		font-weight: 700;
	}

	.page-numbers {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		flex-wrap: wrap;
	}

	.page-number.active {
		background: var(--accent);
		border-color: var(--accent);
		color: white;
	}

	@media (max-width: 840px) {
		.hero {
			grid-template-columns: 1fr;
		}

		.hero-stats {
			justify-content: flex-start;
		}

		.posts {
			grid-template-columns: 1fr;
		}

		.pagination {
			justify-content: center;
		}
	}

	@media (max-width: 640px) {
		.page-shell {
			padding-inline: 0.75rem;
		}

		.hero {
			padding: 1.25rem;
		}

		.post-card {
			padding: 1.05rem;
		}

		.toolbar {
			align-items: stretch;
		}

		.ghost-button {
			width: 100%;
		}
	}
</style>
