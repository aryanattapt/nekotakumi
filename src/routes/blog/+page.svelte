<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { detectLanguage, estimateReadingMinutes } from "$lib/blog-meta";
	import { canonicalUrl, defaultDescription, jsonLd, ogImageUrl, siteName } from "$lib/seo";
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
	<title>Blog — Nekotakumi Labs</title>
	<meta name="description" content={defaultDescription} />
	<meta name="robots" content={data.q ? "noindex, follow" : "index, follow"} />
	<link rel="canonical" href={canonicalUrl(page.url, "/blog")} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Blog — Nekotakumi Labs" />
	<meta property="og:description" content={defaultDescription} />
	<meta property="og:url" content={canonicalUrl(page.url, "/blog")} />
	<meta property="og:image" content={ogImageUrl(page.url)} />
	<meta name="twitter:title" content="Blog — Nekotakumi Labs" />
	<meta name="twitter:description" content={defaultDescription} />
	<meta name="twitter:image" content={ogImageUrl(page.url)} />
	<script type="application/ld+json">
		{jsonLd({
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: siteName,
			url: canonicalUrl(page.url, "/blog"),
			description: defaultDescription,
			inLanguage: "en-US",
			potentialAction: {
				"@type": "SearchAction",
				target: `${canonicalUrl(page.url, "/blog")}?q={search_term_string}`,
				"query-input": "required name=search_term_string"
			}
		})}
	</script>
</svelte:head>

<div class="page-shell">
	<section class="hero">
		<div class="hero-copy">
			<p class="eyebrow">The blog</p>
			<h1>Notes from the lab.</h1>
			<p class="subtitle">Ideas, things I’ve learned, and the occasional side quest. A personal blog from inside Nekotakumi Labs.</p>
		</div>

		<div class="hero-stats">
			<div class="stat">
				<span class="stat-label">Posts</span>
				<strong>{data.total}</strong>
			</div>
			<div class="stat">
				<span class="stat-label">Pages</span>
				<strong>{data.totalPages || 0}</strong>
			</div>
		</div>
	</section>

	<section class="toolbar">
		<label class="search">
			<span>Search posts</span>
			<input
				type="search"
				placeholder="Title or excerpt..."
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
		<p class="search-info">Showing results for <strong>{data.q}</strong>. {data.total} posts found.</p>
	{/if}

	{#if loading}
		<div class="state-card">Loading posts...</div>
	{:else if data.posts.length === 0}
		<div class="state-card empty">{data.q ? "No posts match that search." : "No posts have been published yet."}</div>
	{:else}
		<div class="posts">
			{#each data.posts as post}
				<article class="post-card">
					<div class="post-topline">
						<time>{new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
						<span class="language-tag">{detectLanguage(post.content)}</span>
						<span class="read-time">{estimateReadingMinutes(post.content)} min read</span>
					</div>
					<h2><a href={"/blog/" + post.slug}>{post.title}</a></h2>
					{#if post.excerpt}
						<p class="excerpt">{post.excerpt}</p>
					{/if}
					<a href={"/blog/" + post.slug} class="read-more">Read the post</a>
				</article>
			{/each}
		</div>

		{#if data.totalPages > 1}
			<nav class="pagination" aria-label="Blog pagination">
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
		gap: 0.4rem;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		font-size: 12px;
		color: var(--accent-hover);
		font-weight: 700;
		margin-bottom: 0.75rem;
	}

	h1 {
		font-size: clamp(2.2rem, 4vw, 4rem);
		line-height: 0.98;
		margin-bottom: 0.75rem;
	}

	.subtitle {
		max-width: 58ch;
		color: var(--text-muted);
		font-size: 1.0625rem;
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
		border-radius: var(--radius);
		background: var(--card);
		border: 1px solid var(--border);
	}

	.stat-label {
		display: block;
		font-size: 0.75rem;
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
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.search input {
		width: 100%;
		padding: 0.9rem 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
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

	.ghost-button:hover,
	.page-step:hover,
	.page-number:hover {
		transform: translateY(-1px);
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

	.state-card.empty {
		color: var(--text-muted);
	}

	.posts {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0;
		margin-top: 0.75rem;
		border-top: 1px solid var(--border);
	}

	.post-card {
		padding: 1.3rem 0.5rem;
		border-bottom: 1px solid var(--border);
		background: transparent;
		transition: transform var(--duration-ui) var(--ease-spring);
	}

	.post-card:hover {
		transform: translateX(3px);
	}

	.post-topline {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.75rem;
		color: var(--text-muted);
		font-size: 0.82rem;
	}

	.language-tag { padding: 3px 6px; border-radius: 6px; background: var(--sprout); color: var(--accent-hover); font: 600 12px/1.3 var(--font-mono); }
	.read-time { color: var(--text-muted); font: 500 12px/1.4 var(--font-mono); white-space: nowrap; }

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
		border-radius: var(--radius);
		background: var(--card);
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

		.post-topline {
			flex-wrap: wrap;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.post-card, .ghost-button, .page-step, .page-number { transition: none; }
	}
</style>
