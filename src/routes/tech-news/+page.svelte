<script lang="ts">
	let { data } = $props();

	let items = $state(data.items);
	let page = $state(data.page);
	let totalPages = $state(data.totalPages);
	let q = $state(data.q);
	let total = $state(data.total);
	let loading = $state(false);

	let searchInput = $state("");
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	async function doSearch(val: string) {
		loading = true;
		const params = new URLSearchParams();
		if (val.trim()) params.set("q", val.trim());
		params.set("page", "1");
		params.set("limit", "20");
		params.set("category", "tech");

		try {
			const res = await fetch("/api/news?" + params.toString());
			const json = await res.json();
			items = json.items;
			page = json.page;
			totalPages = json.totalPages;
			q = json.q;
			total = json.total;
		} catch (e) {
			console.error("search failed", e);
		} finally {
			loading = false;
		}
	}

	function onInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		searchInput = val;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => doSearch(val), 400);
	}

	async function goToPage(p: number) {
		loading = true;
		const params = new URLSearchParams();
		if (q) params.set("q", q);
		params.set("page", String(p));
		params.set("limit", "20");
		params.set("category", "tech");

		try {
			const res = await fetch("/api/news?" + params.toString());
			const json = await res.json();
			items = json.items;
			page = json.page;
			totalPages = json.totalPages;
		} catch (e) {
			console.error("pagination failed", e);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Tech News — Nekotakumi</title>
	<meta name="description" content="Tech News Nekotakumi: listing berita teknologi dari berbagai sumber." />
</svelte:head>

<div class="page">
	<div class="hero card">
		<p class="eyebrow">Tech news</p>
		<h1>🖥️ Tech News</h1>
		<p class="subtitle">Berita teknologi terbaru dari berbagai sumber.</p>
	</div>

	<div class="search-bar">
		<input
			type="text"
			placeholder="Cari berita..."
			bind:value={searchInput}
			oninput={onInput}
		/>
		{#if q}
			<button class="clear-search" onclick={() => { searchInput = ""; doSearch(""); }}>&times; Hapus filter</button>
		{/if}
	</div>

	{#if q}
		<p class="search-info">Hasil pencarian untuk "<strong>{q}</strong>" — {total} ditemukan</p>
	{/if}

	{#if loading}
		<div class="loading">Memuat...</div>
	{:else if items.length === 0}
		<div class="empty card">{q ? "Tidak ada berita yang cocok." : "Belum ada berita teknologi."}</div>
	{:else}
		<div class="posts">
			{#each items as item}
				<article class="card">
					<div class="meta">
						{#if item.sourceName}
							<span class="source">{item.sourceName}</span>
						{/if}
						<time>{new Date(item.publishedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</time>
					</div>
					<h2><a href={"/tech-news/" + item.slug}>{item.title}</a></h2>
					{#if item.excerpt}<p class="excerpt">{item.excerpt}</p>{/if}
					{#if item.sourceUrl}
						<a class="read-more" href={item.sourceUrl} target="_blank" rel="noopener">Baca di sumber asli &rarr;</a>
					{/if}
				</article>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="pagination">
				<button disabled={page <= 1} onclick={() => goToPage(page - 1)}>Sebelumnya</button>
				<span class="page-info">Halaman {page} dari {totalPages}</span>
				<button disabled={page >= totalPages} onclick={() => goToPage(page + 1)}>Selanjutnya</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.page { max-width: var(--max-w); margin: 0 auto; padding: 2rem 1rem; }
	.hero { margin-bottom: 1.5rem; }
	.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; }
	h1 { font-size: 2rem; margin-bottom: 0.5rem; }
	.eyebrow { color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em; font-size: .8rem; }
	.subtitle { color: var(--text-muted); }
	.search-bar { display: flex; gap: 0.5rem; margin-bottom: 1rem; align-items: center; }
	.search-bar input { flex: 1; padding: 0.6rem 0.8rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-card); color: var(--text); font-size: 0.95rem; }
	.clear-search { padding: 0.5rem 1rem; background: transparent; color: var(--accent) !important; border: 1px solid var(--accent); border-radius: var(--radius); cursor: pointer; font-size: 0.9rem; white-space: nowrap; }
	.search-info { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; }
	.loading { text-align: center; padding: 2rem; color: var(--text-muted); }
	.posts { display: grid; gap: 1rem; }
	.meta { display:flex; justify-content:space-between; gap:1rem; align-items:center; margin-bottom: .5rem; color: var(--text-muted); font-size: .85rem; }
	.source { background: #eef2ff; color: var(--accent); padding: .2rem .5rem; border-radius: 999px; font-weight: 600; font-size: .8rem; }
	h2 { margin: .35rem 0 .5rem; }
	h2 a { color: var(--text) !important; }
	.excerpt { color: var(--text-muted); margin-bottom: .75rem; }
	.read-more { font-weight: 600; }
	.empty { color: var(--text-muted); text-align: center; }
	.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; }
	.pagination button { padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-card); color: var(--text); cursor: pointer; font-size: 0.9rem; }
	.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
	.page-info { color: var(--text-muted); font-size: 0.9rem; }
</style>
