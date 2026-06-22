<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";

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
	<title>Astronomy News - Nekotakumi</title>
	<meta name="description" content="Astronomy News Nekotakumi: berita astronomi dan luar angkasa terbaru." />
</svelte:head>

<div class="page-shell">
	<section class="hero">
		<div class="hero-copy">
			<p class="eyebrow">Space news</p>
			<h1>Astronomy News</h1>
			<p class="subtitle">Berita astronomi dan luar angkasa terbaru, disusun lebih bersih dengan pagination yang nyaman di desktop maupun mobile.</p>
		</div>

		<div class="hero-stats">
			<div class="stat">
				<span class="stat-label">Berita</span>
				<strong>{data.total}</strong>
			</div>
			<div class="stat">
				<span class="stat-label">Halaman</span>
				<strong>{data.totalPages || 0}</strong>
			</div>
		</div>
	</section>

	{#if loading}
		<div class="state-card">Memuat berita antariksa...</div>
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
						<time>{new Date(item.publishedAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</time>
					</div>
					<h2><a href={"/astronomy-news/" + item.slug}>{item.title}</a></h2>
					{#if item.excerpt}<p class="excerpt">{item.excerpt}</p>{/if}
					{#if item.sourceUrl}
						<a class="read-more" href={item.sourceUrl} target="_blank" rel="noopener">Baca di sumber asli</a>
					{/if}
				</article>
			{/each}
		</div>

		{#if data.totalPages > 1}
			<nav class="pagination" aria-label="Navigasi halaman astronomy news">
				<button type="button" class="page-step" disabled={loading || data.page <= 1} onclick={() => goTo(data.page - 1)}>Sebelumnya</button>

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

				<button type="button" class="page-step" disabled={loading || data.page >= data.totalPages} onclick={() => goTo(data.page + 1)}>Selanjutnya</button>
			</nav>
		{/if}
	{:else}
		<div class="state-card empty">Belum ada berita astronomi.</div>
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
		border-radius: calc(var(--radius) * 1.5);
		background:
			radial-gradient(circle at top left, rgba(59, 130, 246, 0.15), transparent 42%),
			linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(250, 250, 255, 0.88));
		box-shadow: 0 24px 60px rgba(15, 23, 42, 0.06);
	}

	.eyebrow {
		display: inline-flex;
		align-items: center;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		font-size: 0.72rem;
		color: #2563eb;
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
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid var(--border);
		backdrop-filter: blur(10px);
	}

	.stat-label {
		display: block;
		font-size: 0.72rem;
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
		border-radius: 1.25rem;
		border: 1px solid var(--border);
		background: rgba(255, 255, 255, 0.88);
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
		border-radius: 1.25rem;
		border: 1px solid var(--border);
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(252, 252, 255, 0.94));
		box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
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
		border-radius: 999px;
		background: color-mix(in srgb, #2563eb 10%, white);
		color: #2563eb;
		font-size: 0.72rem;
		font-weight: 700;
	}

	.pill.alt {
		background: color-mix(in srgb, var(--accent) 10%, white);
		color: var(--accent);
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
		color: #2563eb;
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
		background: rgba(255, 255, 255, 0.76);
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
		background: rgba(255, 255, 255, 0.92);
		color: var(--text);
		border-radius: 999px;
		padding: 0.8rem 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
	}

	.page-step:hover,
	.page-number:hover {
		transform: translateY(-1px);
		box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
		border-color: color-mix(in srgb, #2563eb 22%, var(--border));
	}

	.page-step:disabled,
	.page-number:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.page-number.active {
		background: #2563eb;
		border-color: #2563eb;
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
