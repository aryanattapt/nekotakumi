<script lang="ts">
	import { page } from "$app/state";
	import { canonicalUrl, jsonLd, ogImageUrl, siteName } from "$lib/seo";

	let { data } = $props();

	const description = $derived(data.item.excerpt || data.item.title);
	const articleUrl = $derived(canonicalUrl(page.url, `/tech-news/${data.item.slug}`));
	const canonicalHref = $derived(data.item.sourceUrl || articleUrl);
	const imageUrl = $derived(ogImageUrl(page.url, data.item.imageUrl));
	const shareText = $derived(`${data.item.title} — Nekotakumi Labs`);
	const encodedArticleUrl = $derived(encodeURIComponent(articleUrl));
	const encodedShareText = $derived(encodeURIComponent(shareText));
</script>

<svelte:head>
	<title>{data.item.title} — Tech News · Nekotakumi Labs</title>
	<meta name="description" content={description} />
	<meta name="robots" content="noindex, follow" />
	<link rel="canonical" href={canonicalHref} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={`${data.item.title} — Tech News · Nekotakumi Labs`} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={articleUrl} />
	<meta property="og:image" content={imageUrl} />
	<meta name="twitter:image" content={imageUrl} />
	<meta property="article:published_time" content={new Date(data.item.publishedAt).toISOString()} />
	<meta name="twitter:title" content={`${data.item.title} — Tech News · Nekotakumi Labs`} />
	<meta name="twitter:description" content={description} />
	<script type="application/ld+json">
		{jsonLd({
			"@context": "https://schema.org",
			"@type": "NewsArticle",
			headline: data.item.title,
			description,
			url: articleUrl,
			image: imageUrl,
			datePublished: new Date(data.item.publishedAt).toISOString(),
			author: {
				"@type": "Organization",
				name: data.item.sourceName || siteName
			},
			publisher: {
				"@type": "Organization",
				name: siteName
			},
			isBasedOn: data.item.sourceUrl || undefined
		})}
	</script>
</svelte:head>

<div class="page-shell">
	<article class="card">
		<div class="meta">
			<a href="/tech-news" class="back">&larr; Back to Tech News</a>
			{#if data.item.sourceName}
				<span class="source">{data.item.sourceName}</span>
			{/if}
		</div>

		<h1>{data.item.title}</h1>
		<time>{new Date(data.item.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>

		{#if data.item.content}
			<div class="content">{@html data.item.content}</div>
		{/if}

		{#if data.item.sourceUrl}
			<div class="source-link">
				<a href={data.item.sourceUrl} target="_blank" rel="noopener">Read original source &rarr;</a>
			</div>
		{/if}

		<nav class="related-links" aria-label="Related pages">
			<a href="/tech-news">More Tech News</a>
			<a href="/blog">The blog</a>
			<a href="/ihsg">IHSG data</a>
		</nav>

		<nav class="share-links" aria-label="Share this story">
			<a href={`https://twitter.com/intent/tweet?url=${encodedArticleUrl}&text=${encodedShareText}`} target="_blank" rel="noopener noreferrer">Share on X</a>
			<a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedArticleUrl}`} target="_blank" rel="noopener noreferrer">Share on LinkedIn</a>
			<a href={`https://api.whatsapp.com/send?text=${encodedShareText}%20${encodedArticleUrl}`} target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
		</nav>
	</article>
</div>

<style>
	.page-shell {
		max-width: 900px;
		margin: 0 auto;
		padding: 1.25rem 1rem 3rem;
	}

	.card {
		padding: 2rem;
		border-radius: calc(var(--radius) * 1.35);
		border: 1px solid var(--border);
		background:
			radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 38%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(252, 252, 255, 0.94));
		box-shadow: 0 18px 48px rgba(15, 23, 42, 0.07);
	}

	.meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.back {
		display: inline-flex;
		padding: 0.6rem 0.85rem;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: rgba(255, 255, 255, 0.86);
		font-size: 0.9rem;
		font-weight: 600;
	}

	.source {
		display: inline-flex;
		padding: 0.35rem 0.7rem;
		border-radius: 999px;
		background: color-mix(in srgb, #0ea5e9 11%, white);
		color: #0284c7;
		font-weight: 700;
		font-size: 0.8rem;
	}

	h1 {
		font-size: clamp(1.9rem, 3vw, 2.8rem);
		line-height: 1.1;
		margin-bottom: 0.5rem;
	}

	time {
		color: var(--text-muted);
		font-size: 0.85rem;
		display: block;
		margin-bottom: 1.3rem;
	}

	.content {
		line-height: 1.8;
		color: var(--text);
	}

	.content :global(p) {
		margin-bottom: 1rem;
	}

	.content :global(h2) {
		font-size: 1.35rem;
		margin: 1.5rem 0 0.75rem;
	}

	.content :global(h3) {
		font-size: 1.15rem;
		margin: 1.25rem 0 0.5rem;
	}

	.content :global(ul),
	.content :global(ol) {
		margin: 0.75rem 0;
		padding-left: 1.5rem;
	}

	.content :global(li) {
		margin-bottom: 0.4rem;
	}

	.content :global(img) {
		max-width: 100%;
		border-radius: var(--radius);
		margin: 1rem 0;
	}

	.content :global(blockquote) {
		border-left: 3px solid var(--accent);
		padding-left: 1rem;
		margin: 1rem 0;
		color: var(--text-muted);
	}

	.content :global(pre) {
		background: #0f172a;
		color: #e2e8f0;
		padding: 1rem;
		border-radius: var(--radius);
		overflow-x: auto;
		margin: 1rem 0;
	}

	.content :global(code) {
		font-size: 0.9rem;
	}

	.source-link {
		margin-top: 1.6rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.source-link a {
		font-weight: 700;
	}

	.related-links {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 1rem;
	}

	.related-links a {
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0.7rem 0.95rem;
		background: rgba(255, 255, 255, 0.9);
		font-weight: 700;
	}

	.share-links {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-top: 0.75rem;
	}

	.share-links a {
		color: var(--text-muted);
		font-size: 0.9rem;
		font-weight: 700;
	}

	@media (max-width: 640px) {
		.page-shell {
			padding-inline: 0.75rem;
		}

		.card {
			padding: 1.25rem;
		}
	}
</style>
