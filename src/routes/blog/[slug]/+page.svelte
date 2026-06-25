<script lang="ts">
	import { page } from "$app/state";
	import { canonicalUrl, jsonLd, ogImageUrl, siteName } from "$lib/seo";

	let { data } = $props();

	const description = $derived(data.post.excerpt || data.post.title);
	const articleUrl = $derived(canonicalUrl(page.url, `/blog/${data.post.slug}`));
	const shareText = $derived(`${data.post.title} - Nekotakumi`);
	const encodedArticleUrl = $derived(encodeURIComponent(articleUrl));
	const encodedShareText = $derived(encodeURIComponent(shareText));
</script>

<svelte:head>
	<title>{data.post.title} - Nekotakumi</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={articleUrl} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={`${data.post.title} - Nekotakumi`} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={articleUrl} />
	<meta property="og:image" content={ogImageUrl(page.url)} />
	<meta property="article:published_time" content={new Date(data.post.createdAt).toISOString()} />
	<meta property="article:modified_time" content={new Date(data.post.updatedAt).toISOString()} />
	<meta name="twitter:title" content={`${data.post.title} - Nekotakumi`} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImageUrl(page.url)} />
	<script type="application/ld+json">
		{jsonLd({
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			headline: data.post.title,
			description,
			url: articleUrl,
			datePublished: new Date(data.post.createdAt).toISOString(),
			dateModified: new Date(data.post.updatedAt).toISOString(),
			author: {
				"@type": "Person",
				name: "Arya"
			},
			publisher: {
				"@type": "Organization",
				name: siteName
			}
		})}
	</script>
</svelte:head>

<div class="page-shell">
	<article class="post">
		<header class="post-header">
			<p class="eyebrow">Blog post</p>
			<h1>{data.post.title}</h1>
			<time>{new Date(data.post.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</time>
		</header>

		<div class="content">
			{@html data.post.content}
		</div>
	</article>

	<div class="back-nav">
		<a href="/" class="back-link">&larr; Kembali ke blog</a>
	</div>

	<nav class="related-links" aria-label="Konten terkait">
		<a href="/tech-news">Baca tech news</a>
		<a href="/ihsg">Pantau IHSG</a>
		<a href="/tentang">Tentang Nekotakumi</a>
	</nav>

	<nav class="share-links" aria-label="Bagikan artikel">
		<a href={`https://twitter.com/intent/tweet?url=${encodedArticleUrl}&text=${encodedShareText}`} target="_blank" rel="noopener noreferrer">Bagikan ke X</a>
		<a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedArticleUrl}`} target="_blank" rel="noopener noreferrer">Bagikan ke LinkedIn</a>
		<a href={`https://api.whatsapp.com/send?text=${encodedShareText}%20${encodedArticleUrl}`} target="_blank" rel="noopener noreferrer">Bagikan ke WhatsApp</a>
	</nav>
</div>

<style>
	.page-shell {
		max-width: 900px;
		margin: 0 auto;
		padding: 1.25rem 1rem 3rem;
	}

	.post {
		padding: 2rem;
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) * 1.35);
		background:
			radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 40%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(252, 252, 255, 0.94));
		box-shadow: 0 18px 48px rgba(15, 23, 42, 0.07);
	}

	.post-header {
		margin-bottom: 1.75rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--border);
	}

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.18em;
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--accent);
		margin-bottom: 0.75rem;
	}

	h1 {
		font-size: clamp(2rem, 4vw, 3.25rem);
		line-height: 1.05;
		margin-bottom: 0.6rem;
	}

	time {
		display: inline-flex;
		font-size: 0.82rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.content {
		font-size: 1.05rem;
		line-height: 1.8;
	}

	.content :global(p) {
		margin-bottom: 1.15rem;
	}

	.content :global(h2) {
		font-size: 1.45rem;
		margin: 2rem 0 1rem;
	}

	.content :global(h3) {
		font-size: 1.2rem;
		margin: 1.5rem 0 0.7rem;
	}

	.content :global(ul),
	.content :global(ol) {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	.content :global(li) {
		margin-bottom: 0.5rem;
	}

	.back-nav {
		margin-top: 1.25rem;
		text-align: center;
	}

	.back-link {
		display: inline-flex;
		padding: 0.75rem 1rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.9);
		font-weight: 600;
	}

	.related-links {
		display: flex;
		justify-content: center;
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
		justify-content: center;
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

		.post {
			padding: 1.25rem;
		}
	}
</style>
