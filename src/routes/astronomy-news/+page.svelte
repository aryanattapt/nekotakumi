<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Astronomy News — Nekotakumi</title>
	<meta name="description" content="Astronomy News Nekotakumi: berita astronomi dan luar angkasa terbaru." />
</svelte:head>

<div class="page">
	<div class="hero card">
		<p class="eyebrow">Space news</p>
		<h1>🔭 Astronomy News</h1>
		<p class="subtitle">Berita astronomi dan luar angkasa terbaru.</p>
	</div>

	{#if data.items?.length}
		<div class="posts">
			{#each data.items as item}
				<article class="card">
					<div class="meta">
						{#if item.sourceName}
							<span class="source">{item.sourceName}</span>
						{/if}
						<time>{new Date(item.publishedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</time>
					</div>
					<h2><a href={"/astronomy-news/" + item.slug}>{item.title}</a></h2>
					{#if item.excerpt}<p class="excerpt">{item.excerpt}</p>{/if}
					{#if item.sourceUrl}
						<a class="read-more" href={item.sourceUrl} target="_blank" rel="noopener">Baca di sumber asli &rarr;</a>
					{/if}
				</article>
			{/each}
		</div>
	{:else}
		<div class="empty card">Belum ada berita astronomi.</div>
	{/if}
</div>

<style>
	.page { max-width: var(--max-w); margin: 0 auto; padding: 2rem 1rem; }
	.hero { margin-bottom: 1.5rem; }
	.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; }
	h1 { font-size: 2rem; margin-bottom: 0.5rem; }
	.eyebrow { color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em; font-size: .8rem; }
	.subtitle { color: var(--text-muted); }
	.posts { display: grid; gap: 1rem; }
	.meta { display:flex; justify-content:space-between; gap:1rem; align-items:center; margin-bottom: .5rem; color: var(--text-muted); font-size: .85rem; }
	.source { background: #eef2ff; color: var(--accent); padding: .2rem .5rem; border-radius: 999px; font-weight: 600; font-size: .8rem; }
	h2 { margin: .35rem 0 .5rem; }
	h2 a { color: var(--text) !important; }
	.excerpt { color: var(--text-muted); margin-bottom: .75rem; }
	.read-more { font-weight: 600; }
	.empty { color: var(--text-muted); }
</style>
