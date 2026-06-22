<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.item.title} - Tech News Nekotakumi</title>
	<meta name="description" content={data.item.excerpt || data.item.title} />
</svelte:head>

<div class="page-shell">
	<article class="card">
		<div class="meta">
			<a href="/tech-news" class="back">&larr; Kembali</a>
			{#if data.item.sourceName}
				<span class="source">{data.item.sourceName}</span>
			{/if}
		</div>

		<h1>{data.item.title}</h1>
		<time>{new Date(data.item.publishedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</time>

		{#if data.item.content}
			<div class="content">{@html data.item.content}</div>
		{/if}

		{#if data.item.sourceUrl}
			<div class="source-link">
				<a href={data.item.sourceUrl} target="_blank" rel="noopener">Baca di sumber asli &rarr;</a>
			</div>
		{/if}
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

	@media (max-width: 640px) {
		.page-shell {
			padding-inline: 0.75rem;
		}

		.card {
			padding: 1.25rem;
		}
	}
</style>
