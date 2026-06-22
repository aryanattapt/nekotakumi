<svelte:head>
	<title>Tentang — Nekotakumi</title>
	<meta
		name="description"
		content="Tentang Nekotakumi: blog, news, dan halaman konten yang lagi aktif."
	/>
</svelte:head>

<div class="page">
	<section class="card hero">
		<p class="eyebrow">Tentang site</p>
		<h1>📝 Tentang Nekotakumi</h1>
		<p>
			Nekotakumi tempat catatan, tutorial, dan update ringan seputar teknologi, berita, dan hal
			random lain yang layak disimpan.
		</p>
	</section>

	<section class="grid">
		<div class="card">
			<h2>Fokus</h2>
			<p>Konten ringkas, cepat dibaca, dan gampang dibagi ke route publik.</p>
		</div>
		<div class="card">
			<h2>Route aktif</h2>
			<ul>
				<li><code>/</code> blog utama</li>
				<li><code>/astronomy-news</code> dan <code>/ihsg</code></li>
				<li><code>/tentang</code> halaman ini</li>
			</ul>
		</div>
	</section>
</div>

<style>
	.page { max-width: var(--max-w); margin: 0 auto; padding: 2rem 1rem; display: grid; gap: 1rem; }
	.grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
	.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; }
	.hero { display: grid; gap: .5rem; }
	.eyebrow { color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em; font-size: .8rem; }
	h1, h2 { margin-bottom: .25rem; }
	p, li { color: var(--text); }
	ul { padding-left: 1.25rem; }
	li { margin-bottom: .4rem; }
	code { background: color-mix(in srgb, var(--bg-card) 75%, transparent); padding: .1rem .35rem; border-radius: .35rem; }
</style>
