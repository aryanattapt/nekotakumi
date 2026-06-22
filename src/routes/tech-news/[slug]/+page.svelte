<script lang="ts">
	let { data } = $props();
	let { item } = data;
</script>

<svelte:head>
	<title>{item.title} — Tech News Nekotakumi</title>
	<meta name="description" content={item.excerpt || item.title} />
</svelte:head>

<div class="page">
	<article class="card">
		<div class="meta">
			<a href="/tech-news" class="back">&larr; Kembali</a>
			{#if item.sourceName}
				<span class="source">{item.sourceName}</span>
			{/if}
		</div>

		<h1>{item.title}</h1>

		<time>{new Date(item.publishedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</time>

		{#if item.content}
			<div class="content">{@html item.content}</div>
		{/if}

		{#if item.sourceUrl}
			<div class="source-link">
				<a href={item.sourceUrl} target="_blank" rel="noopener">Baca di sumber asli &rarr;</a>
			</div>
		{/if}
	</article>
</div>

<style>
	.page { max-width: var(--max-w); margin: 0 auto; padding: 2rem 1rem; }
	.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; }
	.meta { display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem; }
	.back { font-size: 0.9rem; color: var(--accent) !important; }
	.source { background: #eef2ff; color: var(--accent); padding: .2rem .5rem; border-radius: 999px; font-weight: 600; font-size: .8rem; }
	h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
	time { color: var(--text-muted); font-size: 0.85rem; display: block; margin-bottom: 1.5rem; }
	.content { line-height: 1.8; color: var(--text); }
	.content :global(p) { margin-bottom: 1rem; }
	.content :global(h2) { font-size: 1.35rem; margin: 1.5rem 0 0.75rem; }
	.content :global(h3) { font-size: 1.15rem; margin: 1.25rem 0 0.5rem; }
	.content :global(ul), .content :global(ol) { margin: 0.75rem 0; padding-left: 1.5rem; }
	.content :global(li) { margin-bottom: 0.4rem; }
	.content :global(img) { max-width: 100%; border-radius: var(--radius); margin: 1rem 0; }
	.content :global(blockquote) { border-left: 3px solid var(--accent); padding-left: 1rem; margin: 1rem 0; color: var(--text-muted); }
	.content :global(pre) { background: #1a1a2e; color: #e2e8f0; padding: 1rem; border-radius: var(--radius); overflow-x: auto; margin: 1rem 0; }
	.content :global(code) { font-size: 0.9rem; }
	.source-link { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border); }
	.source-link a { font-weight: 600; }
</style>
