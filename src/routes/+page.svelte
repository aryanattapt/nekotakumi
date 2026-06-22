<script lang="ts">
	let { data } = $props();

	let posts = $state(data.posts);
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
		params.set("limit", "10");

		try {
			const res = await fetch("/api/posts?" + params.toString());
			const json = await res.json();
			posts = json.items;
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
		params.set("limit", "10");

		try {
			const res = await fetch("/api/posts?" + params.toString());
			const json = await res.json();
			posts = json.items;
			page = json.page;
			totalPages = json.totalPages;
			q = json.q;
			total = json.total;
		} catch (e) {
			console.error("pagination failed", e);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Nekotakumi — Blog</title>
</svelte:head>

<div class="hero">
	<h1>Nekotakumi</h1>
	<p class="subtitle">Catatan, tutorial, dan hal-hal random</p>
</div>

<div class="container">
	<div class="search-bar">
		<input
			type="text"
			placeholder="Cari postingan..."
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
	{:else if posts.length === 0}
		<div class="empty">
			<p>{q ? "Tidak ada postingan yang cocok." : "Belum ada postingan."}</p>
		</div>
	{:else}
		<div class="posts">
			{#each posts as post}
				<article class="post-card">
					<time>{new Date(post.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</time>
					<h2><a href="/blog/{post.slug}">{post.title}</a></h2>
					{#if post.excerpt}
						<p class="excerpt">{post.excerpt}</p>
					{/if}
					<a href="/blog/{post.slug}" class="read-more">Baca selengkapnya &rarr;</a>
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
	.hero {
		text-align: center;
		padding: 4rem 1rem 3rem;
		background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #faf5ff 100%);
	}

	.hero h1 {
		font-size: 2.5rem;
		font-weight: 800;
		margin-bottom: 0.5rem;
		background: linear-gradient(135deg, #7c3aed, #a855f7);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		color: var(--text-muted);
		font-size: 1.1rem;
	}

	.container {
		max-width: var(--max-w);
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.search-bar {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
		align-items: center;
	}

	.search-bar input {
		flex: 1;
		padding: 0.6rem 0.8rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-card);
		color: var(--text);
		font-size: 0.95rem;
	}

	.clear-search {
		padding: 0.5rem 1rem;
		background: transparent;
		color: var(--accent) !important;
		border: 1px solid var(--accent);
		border-radius: var(--radius);
		cursor: pointer;
		font-size: 0.9rem;
		white-space: nowrap;
	}

	.search-info {
		color: var(--text-muted);
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.loading {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted);
	}

	.empty {
		text-align: center;
		padding: 3rem;
		color: var(--text-muted);
	}

	.posts {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.post-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1.5rem;
		transition: box-shadow 0.2s, transform 0.2s;
	}

	.post-card:hover {
		box-shadow: 0 4px 12px rgba(0,0,0,0.08);
		transform: translateY(-2px);
	}

	.post-card time {
		font-size: 0.8rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.post-card h2 {
		margin: 0.5rem 0;
		font-size: 1.35rem;
	}

	.post-card h2 a {
		color: var(--text) !important;
	}

	.post-card h2 a:hover {
		color: var(--accent) !important;
	}

	.excerpt {
		color: var(--text-muted);
		font-size: 0.95rem;
		margin-bottom: 0.75rem;
	}

	.read-more {
		font-size: 0.9rem;
		font-weight: 500;
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-top: 2rem;
	}

	.pagination button {
		padding: 0.5rem 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg-card);
		color: var(--text);
		cursor: pointer;
		font-size: 0.9rem;
	}

	.pagination button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.page-info {
		color: var(--text-muted);
		font-size: 0.9rem;
	}
</style>
