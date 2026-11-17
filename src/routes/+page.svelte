<script lang="ts">
	import { page } from '$app/state';
	import { canonicalUrl, defaultDescription, jsonLd, ogImageUrl, siteName } from '$lib/seo';

	let { data } = $props();

	const experiments = [
		{
			number: '01',
			name: 'Takumi Research Agent',
			category: 'AI · Research',
			status: 'In development',
			description: 'An AI research workflow that traces its sources and prepares article drafts in Indonesian and English.',
			url: 'https://github.com/aryanattapt/takumi-research-agent-v0',
			color: 'violet',
			mark: 'T'
		},
		{
			number: '02',
			name: 'Takumi Job Search Assistant',
			category: 'AI · Personal tools',
			status: 'In development',
			description: 'A self-hosted workspace for researching roles, preparing applications, and keeping the process organized.',
			url: 'https://github.com/aryanattapt/takumi-jobsearch-assistant',
			color: 'blue',
			mark: 'J'
		},
		{
			number: '03',
			name: 'FarmaGO',
			category: 'Product · Healthcare',
			status: 'MVP in development',
			description: 'An e-pharmacy MVP exploring product discovery, pharmacy selection, prescription review, and delivery.',
			url: 'https://github.com/aryanattapt/farmago',
			color: 'coral',
			mark: 'F'
		}
	];
</script>

<svelte:head>
	<title>{siteName} — Build Inspiring Trash</title>
	<meta name="description" content={defaultDescription} />
	<link rel="canonical" href={canonicalUrl(page.url, '/')} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Nekotakumi Labs — Build Inspiring Trash" />
	<meta property="og:description" content={defaultDescription} />
	<meta property="og:url" content={canonicalUrl(page.url, '/')} />
	<meta property="og:image" content={ogImageUrl(page.url)} />
	<meta name="twitter:title" content="Nekotakumi Labs — Build Inspiring Trash" />
	<meta name="twitter:description" content={defaultDescription} />
	<meta name="twitter:image" content={ogImageUrl(page.url)} />
	<script type="application/ld+json">
		{jsonLd({
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: siteName,
			url: canonicalUrl(page.url, '/'),
			description: defaultDescription,
			inLanguage: 'en-US'
		})}
	</script>
</svelte:head>

<div class="home-page">
	<section class="hero">
		<div class="hero-copy motion-rise">
			<p class="eyebrow"><span class="status-dot"></span> Independent R&amp;D · Jakarta, Indonesia</p>
			<h1>Build <span>Inspiring</span><br />Trash<span class="period">.</span></h1>
			<p class="hero-lead">A personal lab for software experiments, side projects, and things I want to figure out.</p>
			<div class="hero-actions">
				<a class="button button-primary" href="#experiments">See what I’m building <span aria-hidden="true">↘</span></a>
				<a class="button button-quiet" href="/blog">Read the blog <span aria-hidden="true">↗</span></a>
			</div>
			<div class="hero-note"><span class="note-line"></span><span>Curiosity in. Experiments out.</span></div>
		</div>

		<div class="hero-art" aria-label="Abstract illustration of ideas taking shape" role="img">
			<div class="art-orbit orbit-one"></div>
			<div class="art-orbit orbit-two"></div>
			<div class="art-spark spark-one">✳</div>
			<div class="art-spark spark-two">✦</div>
			<div class="art-card card-back"><span>idea_004.md</span><i></i><i></i></div>
			<div class="art-card card-front"><span class="card-label">CURRENT MOOD</span><strong>let’s<br />find out<span>!</span></strong><small>prototype in progress</small></div>
			<div class="art-sticker">NO<br />BIG<br />DEAL</div>
			<div class="art-footnote">a tiny corner of the internet <span>↗</span></div>
		</div>
	</section>

	<section class="focus-line" aria-label="Areas of exploration">
		<span>Right now I’m exploring</span>
		<div><span>AI &amp; automation</span><b>·</b><span>Useful little tools</span><b>·</b><span>Systems that work</span></div>
	</section>

	<section class="section experiments-section" id="experiments">
		<div class="section-heading">
			<div><p class="eyebrow">A few things in the works</p><h2>From “what if?” to<br class="mobile-break" /> something real.</h2></div>
			<a class="text-link" href="https://github.com/aryanattapt?tab=repositories" target="_blank" rel="noopener noreferrer">More on GitHub <span aria-hidden="true">↗</span></a>
		</div>

		<div class="experiment-grid">
			{#each experiments as experiment, i}
				<article class={`experiment-card ${experiment.color} motion-rise`} style={`--delay:${i * 90}ms`}>
					<div class="experiment-top"><span class="experiment-number">{experiment.number} / EXPERIMENT</span><span class="experiment-mark">{experiment.mark}</span></div>
					<div class="experiment-meta"><span>{experiment.category}</span><span class="experiment-status"><i></i>{experiment.status}</span></div>
					<h3>{experiment.name}</h3>
					<p>{experiment.description}</p>
					<a href={experiment.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${experiment.name} on GitHub`}>View on GitHub <span aria-hidden="true">↗</span></a>
				</article>
			{/each}
		</div>
	</section>

	<section class="section blog-section">
		<div class="section-heading">
			<div><p class="eyebrow">Notes from the process</p><h2>From the blog.</h2></div>
			<a class="text-link" href="/blog">All posts <span aria-hidden="true">↗</span></a>
		</div>

		{#if data.posts.length}
			<div class="blog-list">
				{#each data.posts as post, i}
					<a class="blog-row motion-rise" style={`--delay:${i * 70}ms`} href={`/blog/${post.slug}`}>
						<time>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
						<span class="blog-row-copy"><strong>{post.title}</strong>{#if post.excerpt}<small>{post.excerpt}</small>{/if}</span>
						<span class="row-arrow" aria-hidden="true">↗</span>
					</a>
				{/each}
			</div>
		{:else}
			<p class="blog-empty">No posts here yet. I’ll add a note when there’s something worth sharing.</p>
		{/if}
	</section>

	<section class="maker-section">
		<div class="maker-mark" aria-hidden="true">a.</div>
		<div><p class="eyebrow">The person behind the tabs</p><h2>Hey, I’m Arya.</h2><p>I’m a software developer who likes trying things out, learning as I go, and occasionally making a mess before it makes sense.</p></div>
		<a class="button button-dark" href="/tentang">A little more about me <span aria-hidden="true">↗</span></a>
	</section>
</div>

<style>
	.home-page { width: min(100% - 2rem, 1160px); margin: 0 auto; }
	.hero { min-height: 570px; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(350px, 0.95fr); align-items: center; gap: 2rem; padding: 4.5rem 0 3.5rem; }
	.hero-copy { position: relative; z-index: 1; animation-delay: 70ms; }
	.eyebrow { display: flex; align-items: center; gap: 0.55rem; margin-bottom: 1rem; color: var(--text-muted); font-size: 0.77rem; font-weight: 700; letter-spacing: 0.075em; text-transform: uppercase; }
	.status-dot { width: 0.55rem; height: 0.55rem; border-radius: 50%; background: #36b37e; box-shadow: 0 0 0 4px rgba(54, 179, 126, 0.12); }
	h1 { margin: 0; font-size: clamp(4rem, 7.4vw, 6.7rem); line-height: 0.94; font-weight: 700; letter-spacing: -0.075em; }
	h1 > span:first-child { color: var(--accent); }
	.period { color: var(--coral); }
	.hero-lead { max-width: 490px; margin: 1.4rem 0 1.6rem; color: var(--text-muted); font-size: clamp(1.05rem, 1.5vw, 1.2rem); line-height: 1.65; }
	.hero-actions { display: flex; flex-wrap: wrap; gap: 0.55rem; }
	.button { display: inline-flex; align-items: center; justify-content: center; gap: 0.8rem; min-height: 48px; padding: 0.75rem 1rem; border-radius: 0.95rem; font-weight: 650; font-size: 0.9rem; transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease; }
	.button:hover { transform: translateY(-2px); text-decoration: none; }
	.button-primary { color: white; background: var(--accent); box-shadow: 0 8px 18px rgba(109, 40, 217, 0.18); }
	.button-primary:hover { background: var(--accent-hover); box-shadow: 0 11px 23px rgba(109, 40, 217, 0.23); }
	.button-quiet { color: var(--text); background: white; border: 1px solid var(--border); }
	.button-quiet:hover { background: #fff; box-shadow: var(--shadow-soft); }
	.hero-note { display: flex; align-items: center; gap: 0.55rem; margin-top: 2rem; color: #8a92a2; font-size: 0.8rem; }
	.note-line { width: 28px; height: 1px; background: var(--coral); }
	.hero-art { position: relative; width: min(100%, 485px); aspect-ratio: 1 / 0.88; justify-self: end; display: grid; place-items: center; isolation: isolate; }
	.hero-art::before { content: ''; position: absolute; width: 77%; aspect-ratio: 1; border-radius: 50%; background: linear-gradient(145deg, #eee8ff, #dfedff); opacity: 0.85; z-index: -2; }
	.art-orbit { position: absolute; width: 90%; height: 72%; border: 1px solid rgba(109, 40, 217, 0.22); border-radius: 50%; transform: rotate(-27deg); z-index: -1; }
	.orbit-two { width: 106%; height: 88%; transform: rotate(24deg); border-color: rgba(37, 99, 235, 0.17); }
	.art-card { position: absolute; width: 245px; min-height: 260px; border-radius: 1.25rem; box-shadow: 0 24px 55px rgba(47, 38, 92, 0.14); }
	.card-back { right: 9%; top: 12%; padding: 1.3rem; transform: rotate(8deg); background: #d9f36f; color: #415115; }
	.card-back span { display: block; font: 600 0.71rem ui-monospace, monospace; opacity: 0.66; margin-bottom: 2rem; }
	.card-back i { display: block; height: 8px; width: 77%; margin: 0.65rem 0; border-radius: 20px; background: rgba(56, 73, 17, 0.17); }
	.card-back i:last-child { width: 48%; }
	.card-front { left: 8%; bottom: 11%; display: flex; flex-direction: column; justify-content: space-between; padding: 1.35rem; transform: rotate(-7deg); background: #fff; color: var(--text); }
	.card-label { font: 700 0.66rem ui-monospace, monospace; color: var(--text-muted); letter-spacing: 0.08em; }
	.card-front strong { font: 700 2.45rem/0.98 'Space Grotesk', sans-serif; letter-spacing: -0.07em; }
	.card-front strong span { color: var(--coral); }
	.card-front small { color: var(--text-muted); font-size: 0.72rem; }
	.art-sticker { position: absolute; right: 1%; bottom: 10%; display: grid; place-items: center; width: 82px; height: 82px; border-radius: 50%; background: var(--coral); color: white; text-align: center; transform: rotate(10deg); font-size: 0.64rem; font-weight: 800; line-height: 1.05; letter-spacing: 0.04em; box-shadow: 0 8px 20px rgba(231, 107, 87, 0.22); animation: gentle-bob 4s ease-in-out infinite; }
	.art-spark { position: absolute; color: var(--accent); font-size: 2.2rem; animation: gentle-bob 4.5s ease-in-out infinite; }
	.spark-one { top: 7%; left: 10%; }
	.spark-two { right: 9%; top: 28%; color: var(--cobalt); font-size: 1.5rem; animation-delay: -1.3s; }
	.art-footnote { position: absolute; right: 4%; bottom: 1%; color: var(--text-muted); font-size: 0.7rem; transform: rotate(-4deg); }
	.art-footnote span { color: var(--accent); }
	@keyframes gentle-bob { 0%, 100% { transform: translateY(0) rotate(10deg); } 50% { transform: translateY(-7px) rotate(7deg); } }
	.focus-line { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.25rem 1.4rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 0.84rem; }
	.focus-line > span { font-weight: 600; }
	.focus-line div { display: flex; flex-wrap: wrap; gap: 0.65rem; align-items: center; color: var(--text); }
	.focus-line b { color: var(--coral); font-size: 1.1rem; }
	.section { padding: 5.3rem 0 0; }
	.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 1.5rem; margin-bottom: 1.6rem; }
	.section-heading .eyebrow { margin-bottom: 0.5rem; }
	.section-heading h2, .maker-section h2 { font-size: clamp(2rem, 4vw, 3.1rem); line-height: 1.05; letter-spacing: -0.06em; }
	.text-link { display: inline-flex; gap: 0.55rem; align-items: center; color: var(--accent); font-weight: 700; font-size: 0.88rem; white-space: nowrap; }
	.text-link:hover { gap: 0.75rem; text-decoration: none; }
	.experiment-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
	.experiment-card { --card-accent: var(--accent); position: relative; min-height: 300px; display: flex; flex-direction: column; align-items: flex-start; padding: 1.35rem; overflow: hidden; border: 1px solid var(--border); border-radius: 1.25rem; background: white; transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease; animation-delay: var(--delay, 0ms); }
	.experiment-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: var(--card-accent); }
	.experiment-card:hover { transform: translateY(-5px); border-color: color-mix(in srgb, var(--card-accent) 30%, var(--border)); box-shadow: 0 18px 38px rgba(24, 32, 51, 0.1); }
	.experiment-card.violet { --card-accent: #8255dc; }
	.experiment-card.blue { --card-accent: #4283ee; }
	.experiment-card.coral { --card-accent: #e76b57; }
	.experiment-top { display: flex; width: 100%; align-items: center; justify-content: space-between; margin-bottom: 1.3rem; }
	.experiment-number { color: var(--text-muted); font: 600 0.65rem ui-monospace, monospace; letter-spacing: 0.055em; }
	.experiment-mark { display: grid; place-items: center; width: 2.6rem; height: 2.6rem; border-radius: 0.9rem; background: color-mix(in srgb, var(--card-accent) 12%, white); color: var(--card-accent); font: 700 1.2rem 'Space Grotesk', sans-serif; }
	.experiment-meta { display: grid; gap: 0.35rem; color: var(--text-muted); font-size: 0.72rem; }
	.experiment-status { display: inline-flex; align-items: center; gap: 0.4rem; }
	.experiment-status i { width: 0.4rem; height: 0.4rem; border-radius: 50%; background: #56b889; }
	.experiment-card h3 { margin: 0.8rem 0 0.5rem; font-size: 1.3rem; line-height: 1.15; letter-spacing: -0.045em; }
	.experiment-card p { margin-bottom: 1.3rem; color: var(--text-muted); font-size: 0.88rem; line-height: 1.58; }
	.experiment-card > a { display: inline-flex; gap: 0.45rem; align-items: center; margin-top: auto; color: var(--card-accent); font-size: 0.84rem; font-weight: 700; }
	.experiment-card > a span { transition: transform 160ms ease; }
	.experiment-card > a:hover span { transform: translate(2px, -2px); }
	.blog-section { padding-top: 5.5rem; }
	.blog-list { border-top: 1px solid var(--border); }
	.blog-row { display: grid; grid-template-columns: 120px minmax(0, 1fr) 30px; gap: 1.25rem; align-items: center; padding: 1.25rem 0.25rem; border-bottom: 1px solid var(--border); color: inherit; transition: background 180ms ease, padding 180ms ease; animation-delay: var(--delay, 0ms); }
	.blog-row:hover { padding-inline: 0.75rem; background: rgba(255, 255, 255, 0.72); text-decoration: none; }
	.blog-row time { color: var(--text-muted); font-size: 0.78rem; }
	.blog-row-copy { display: grid; gap: 0.2rem; }
	.blog-row-copy strong { color: var(--text); font: 600 1.08rem 'Space Grotesk', sans-serif; }
	.blog-row-copy small { overflow: hidden; color: var(--text-muted); font-size: 0.82rem; text-overflow: ellipsis; white-space: nowrap; }
	.row-arrow { justify-self: end; color: var(--accent); font-size: 1.1rem; transition: transform 180ms ease; }
	.blog-row:hover .row-arrow { transform: translate(2px, -2px); }
	.blog-empty { padding: 1.4rem 0; color: var(--text-muted); }
	.maker-section { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 1.4rem; align-items: center; margin: 5.5rem 0 0; padding: 2.1rem; border-radius: 1.5rem; background: #eeebfb; }
	.maker-mark { display: grid; place-items: center; width: 4.2rem; aspect-ratio: 1; border-radius: 1.35rem; background: var(--accent); color: white; font: 700 2rem 'Space Grotesk', sans-serif; letter-spacing: -0.08em; transform: rotate(-5deg); }
	.maker-section .eyebrow { margin-bottom: 0.35rem; }
	.maker-section h2 { font-size: 2rem; }
	.maker-section p:not(.eyebrow) { max-width: 580px; margin-top: 0.4rem; color: #555e72; font-size: 0.91rem; }
	.button-dark { color: white; background: var(--text); white-space: nowrap; }
	.button-dark:hover { color: white; background: #303b54; }
	.mobile-break { display: none; }
	@media (max-width: 900px) {
		.hero { min-height: 520px; grid-template-columns: 1fr 0.85fr; gap: 0.5rem; }
		h1 { font-size: clamp(3.6rem, 8vw, 5.5rem); }
		.art-card { width: 205px; min-height: 225px; }
		.card-front strong { font-size: 2.15rem; }
		.experiment-grid { gap: 0.7rem; }
		.experiment-card { padding: 1.1rem; }
		.maker-section { grid-template-columns: auto 1fr; }
		.button-dark { grid-column: 2; justify-self: start; }
	}
	@media (max-width: 640px) {
		.home-page { width: min(100% - 1.5rem, 520px); }
		.hero { min-height: auto; grid-template-columns: 1fr; gap: 0.6rem; padding: 3.5rem 0 2rem; }
		.hero-copy { order: 0; }
		h1 { font-size: clamp(3.65rem, 17vw, 5.3rem); }
		.hero-lead { margin: 1.15rem 0 1.3rem; font-size: 1.03rem; }
		.hero-actions { flex-direction: column; align-items: stretch; }
		.hero-actions .button { justify-content: space-between; }
		.hero-note { margin-top: 1.4rem; }
		.hero-art { width: min(100%, 370px); justify-self: center; margin: 0.8rem 0 0.6rem; }
		.art-card { width: 190px; min-height: 210px; }
		.card-front strong { font-size: 2rem; }
		.art-sticker { right: 0; width: 68px; height: 68px; font-size: 0.55rem; }
		.focus-line { align-items: flex-start; flex-direction: column; padding: 1rem 0.2rem; font-size: 0.8rem; }
		.focus-line div { gap: 0.45rem; font-size: 0.78rem; }
		.section { padding-top: 3.7rem; }
		.section-heading { align-items: flex-start; flex-direction: column; gap: 0.8rem; margin-bottom: 1.1rem; }
		.section-heading h2 { font-size: 2.25rem; }
		.mobile-break { display: block; }
		.experiment-grid { grid-template-columns: 1fr; }
		.experiment-card { min-height: 0; padding: 1.2rem; }
		.experiment-card p { margin-bottom: 1rem; }
		.blog-row { grid-template-columns: 1fr 28px; gap: 0.25rem 0.8rem; padding: 1rem 0.15rem; }
		.blog-row time { grid-column: 1; grid-row: 1; }
		.blog-row-copy { grid-column: 1; grid-row: 2; }
		.blog-row-copy strong { font-size: 1rem; }
		.blog-row-copy small { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
		.row-arrow { grid-column: 2; grid-row: 1 / 3; }
		.maker-section { grid-template-columns: auto 1fr; gap: 1rem; margin-top: 3.6rem; padding: 1.25rem; }
		.maker-mark { width: 3.1rem; border-radius: 1rem; font-size: 1.5rem; }
		.maker-section h2 { font-size: 1.65rem; }
		.maker-section p:not(.eyebrow) { font-size: 0.85rem; }
		.button-dark { grid-column: 1 / -1; justify-self: stretch; }
	}
</style>
