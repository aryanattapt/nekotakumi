<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { canonicalUrl, jsonLd, ogImageUrl, siteName } from "$lib/seo";

	let { data } = $props();
	let loading = $state(false);

	function buildUrl(nextPage: number) {
		const next = new URL(page.url);

		if (nextPage > 1) {
			next.searchParams.set("page", String(nextPage));
		} else {
			next.searchParams.delete("page");
		}

		return next;
	}

	async function goTo(nextPage: number) {
		loading = true;
		try {
			await goto(buildUrl(nextPage), {
				replaceState: true,
				noScroll: true
			});
		} finally {
			loading = false;
		}
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
</script>

<svelte:head>
	<title>Astronomy News — Nekotakumi Labs</title>
	<meta name="description" content="Space, astronomy, and the things happening beyond our little corner of the universe." />
	<meta name="robots" content="noindex, follow" />
	<link rel="canonical" href={canonicalUrl(page.url, "/astronomy-news")} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Astronomy News — Nekotakumi Labs" />
	<meta property="og:description" content="Space, astronomy, and the things happening beyond our little corner of the universe." />
	<meta property="og:url" content={canonicalUrl(page.url, "/astronomy-news")} />
	<meta property="og:image" content={ogImageUrl(page.url)} />
	<meta name="twitter:title" content="Astronomy News — Nekotakumi Labs" />
	<meta name="twitter:description" content="Space, astronomy, and the things happening beyond our little corner of the universe." />
	<meta name="twitter:image" content={ogImageUrl(page.url)} />
	<script type="application/ld+json">
		{jsonLd({
			"@context": "https://schema.org",
			"@type": "CollectionPage",
			name: "Astronomy News — Nekotakumi Labs",
			url: canonicalUrl(page.url, "/astronomy-news"),
			description: "Space, astronomy, and the things happening beyond our little corner of the universe.",
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
			<p class="eyebrow">Space news</p>
			<h1>A little space news.</h1>
			<p class="subtitle">Astronomy stories and discoveries from beyond our little corner of the universe.</p>
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
		<a href="/tech-news">Tech news</a>
		<a href="/ihsg">IHSG</a>
	</section>

	{#if loading}
		<div class="state-card">Loading space stories...</div>
	{:else if data.items?.length}
		<div class="posts">
			{#each data.items as item}
				<article class="post-card">
					<div class="post-topline">
						{#if item.sourceName}
							<span class="pill">{item.sourceName}</span>
						{:else}
							<span class="pill alt">Astronomy</span>
						{/if}
						<time>{new Date(item.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
					</div>
					<h2><a href={"/astronomy-news/" + item.slug}>{item.title}</a></h2>
					{#if item.excerpt}<p class="excerpt">{item.excerpt}</p>{/if}
					{#if item.sourceUrl}
						<a class="read-more" href={item.sourceUrl} target="_blank" rel="noopener">Read original source</a>
					{/if}
				</article>
			{/each}
		</div>

		{#if data.totalPages > 1}
			<nav class="pagination" aria-label="Astronomy news pagination">
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
	{:else}
		<div class="state-card empty">No astronomy stories have been added yet.</div>
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

	.state-card {
		padding: 2rem;
		margin-top: 1.25rem;
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
		margin-top: 1.25rem;
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

	.read-more {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-weight: 700;
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

	.page-step,
	.page-number {
		border: 1px solid var(--border);
		background: var(--card);
		color: var(--text);
		border-radius: var(--radius);
		padding: 0.8rem 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform var(--duration-ui) var(--ease-spring);
	}

	.page-step:hover,
	.page-number:hover {
		transform: translateY(-1px);
	}

	.page-step:disabled,
	.page-number:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
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
	}
</style>
