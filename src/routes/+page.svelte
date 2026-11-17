<script lang="ts">
	import { page } from '$app/state';
	import ArrowIcon from '$lib/components/ArrowIcon.svelte';
	import ProjectPreview from '$lib/components/ProjectPreview.svelte';
	import { detectLanguage, estimateReadingMinutes } from '$lib/blog-meta';
	import { revealOnce } from '$lib/actions/reveal';
	import { formatProjectDate, projects } from '$lib/projects';
	import { canonicalUrl, defaultDescription, jsonLd, ogImageUrl, siteName } from '$lib/seo';

	let { data } = $props();

	let dragging: {
		element: HTMLButtonElement;
		pointerId: number;
		startX: number;
		startY: number;
		originX: number;
		originY: number;
	} | null = null;

	function startStickerDrag(event: PointerEvent, element: HTMLButtonElement) {
		if (event.pointerType !== 'mouse' || event.button !== 0 || window.matchMedia('(max-width: 720px)').matches) return;
		event.preventDefault();
		dragging = {
			element,
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			originX: Number.parseFloat(element.style.getPropertyValue('--drag-x')) || 0,
			originY: Number.parseFloat(element.style.getPropertyValue('--drag-y')) || 0
		};
		element.setPointerCapture(event.pointerId);
	}

	function moveSticker(event: PointerEvent) {
		if (!dragging || dragging.pointerId !== event.pointerId) return;
		dragging.element.style.setProperty('--drag-x', `${dragging.originX + event.clientX - dragging.startX}px`);
		dragging.element.style.setProperty('--drag-y', `${dragging.originY + event.clientY - dragging.startY}px`);
	}

	function endStickerDrag(event: PointerEvent) {
		if (!dragging || dragging.pointerId !== event.pointerId) return;
		dragging = null;
	}

	function nudgeSticker(event: KeyboardEvent, element: HTMLButtonElement) {
		const steps: Record<string, [number, number]> = {
			ArrowUp: [0, -8],
			ArrowDown: [0, 8],
			ArrowLeft: [-8, 0],
			ArrowRight: [8, 0]
		};
		const step = steps[event.key];
		if (!step) return;
		event.preventDefault();
		const x = Number.parseFloat(element.style.getPropertyValue('--drag-x')) || 0;
		const y = Number.parseFloat(element.style.getPropertyValue('--drag-y')) || 0;
		element.style.setProperty('--drag-x', `${x + step[0]}px`);
		element.style.setProperty('--drag-y', `${y + step[1]}px`);
	}
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
		<div class="hero-copy">
			<p class="eyebrow"><span class="status-dot"></span> Independent R&amp;D · Jakarta, Indonesia</p>
			<h1 aria-label="Build Inspiring Trash.">
				<span class="hero-word" style="--word-delay: 0ms">Build</span>
				<span class="hero-word hero-word-green" style="--word-delay: 80ms">Inspiring</span><br />
				<span class="hero-word" style="--word-delay: 160ms">Trash</span><span class="period">.</span>
			</h1>
			<p class="hero-lead">The unfinished experiments are the useful part: each one leaves behind a lesson, a tool, or a better question.</p>
			<div class="hero-actions">
				<a class="button button-primary" href="#experiments">See what I’m building <ArrowIcon direction="down-right" /></a>
				<a class="button button-quiet" href="/blog">Read the blog <ArrowIcon /></a>
			</div>
		</div>

		<div class="hero-art" role="group" aria-label="A couple of notes from the lab">
			<button
				type="button"
				class="art-card card-back"
				style="--angle: 7deg; --sticker-delay: 120ms"
				aria-label="Move the idea note with your mouse or arrow keys"
				onpointerdown={(event) => startStickerDrag(event, event.currentTarget)}
				onpointermove={moveSticker}
				onpointerup={endStickerDrag}
				onpointercancel={endStickerDrag}
				onkeydown={(event) => nudgeSticker(event, event.currentTarget)}
			>
				<span class="card-label">idea_004.md</span>
				<strong>What if this<br />works?</strong>
				<i></i><i></i>
			</button>
			<button
				type="button"
				class="art-card card-front"
				style="--angle: -6deg; --sticker-delay: 220ms"
				aria-label="Move the current build note with your mouse or arrow keys"
				onpointerdown={(event) => startStickerDrag(event, event.currentTarget)}
				onpointermove={moveSticker}
				onpointerup={endStickerDrag}
				onpointercancel={endStickerDrag}
				onkeydown={(event) => nudgeSticker(event, event.currentTarget)}
			>
				<span class="card-label">CURRENTLY BUILDING</span>
				<strong>FarmaGO<br />v0.x</strong>
				<small>figuring out the next step</small>
			</button>
			<div class="art-sticker" role="img" aria-label="No big deal">NO<br />BIG<br />DEAL</div>
		</div>
	</section>

	<section class="focus-line reveal" use:revealOnce aria-label="Areas of exploration">
		<span>Right now I’m exploring</span>
		<div><span>AI &amp; automation</span><b>·</b><span>Useful little tools</span><b>·</b><span>Systems that work</span></div>
	</section>

	<section class="section experiments-section" id="experiments" use:revealOnce>
		<div class="section-heading">
			<div><p class="eyebrow">A few things in the works</p><h2>From “what if?” to<br class="mobile-break" /> something real.</h2></div>
			<a class="text-link" href="https://github.com/aryanattapt?tab=repositories" target="_blank" rel="noopener noreferrer">More on GitHub <ArrowIcon /></a>
		</div>

		<div class="experiment-grid">
			{#each projects as project, i}
				<article class="experiment-card reveal" use:revealOnce style={`--delay:${i * 60}ms`}>
					<a class="preview-link" href={`/experiments/${project.slug}`} aria-label={`View ${project.name} experiment details`}>
						<ProjectPreview {project} />
					</a>
					<div class="card-content">
						<div class="experiment-top"><span class="experiment-number">{project.number} / EXPERIMENT</span><span class="category-tag" class:ai={project.category === 'AI'} class:product={project.category === 'Product'}>{project.categoryDetail}</span></div>
						<span class="experiment-status"><i></i>{project.status}</span>
						<h3><a href={`/experiments/${project.slug}`}>{project.name}</a></h3>
						<div class="experiment-lines">
							<p><strong>Problem</strong><span>{project.problem}</span></p>
							<p><strong>Approach</strong><span>{project.approach}</span></p>
						</div>
						<div class="focus-chips" aria-label="Focus areas">
							{#each project.focusAreas as area}<span>{area}</span>{/each}
						</div>
						<div class="card-footer">
							<time datetime={project.updatedAt}>Updated {formatProjectDate(project.updatedAt)}</time>
							<a href={project.githubUrl} target="_blank" rel="noopener noreferrer">View on GitHub <ArrowIcon /></a>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</section>

	<section class="section blog-section" use:revealOnce>
		<div class="section-heading">
			<div><p class="eyebrow">Notes from the process</p><h2>From the blog.</h2></div>
			<a class="text-link" href="/blog">All posts <ArrowIcon /></a>
		</div>

		{#if data.posts.length}
			<div class="blog-list">
				{#each data.posts as post, i}
					<a class="blog-row reveal" use:revealOnce style={`--delay:${i * 50}ms`} href={`/blog/${post.slug}`}>
						<span class="blog-row-meta">
							<time>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
							<span class="language-tag">{detectLanguage(post.content)}</span>
							<span class="read-time">{estimateReadingMinutes(post.content)} min read</span>
						</span>
						<span class="blog-row-copy"><strong>{post.title}</strong>{#if post.excerpt}<small>{post.excerpt}</small>{/if}</span>
						<span class="row-arrow"><ArrowIcon size={18} /></span>
					</a>
				{/each}
			</div>
		{:else}
			<p class="blog-empty">No posts here yet. I’ll add a note when there’s something worth sharing.</p>
		{/if}
	</section>

	<section class="maker-section reveal" use:revealOnce>
		<div class="maker-mark" aria-hidden="true">a.</div>
		<div><p class="eyebrow">The person behind the tabs</p><h2>Hey, I’m Arya.</h2><p>I work across product engineering and systems analysis, with 6+ years in FMCG technology. This lab is where I test ideas through small prototypes and AI automation.</p></div>
		<a class="button button-dark" href="/tentang">A little more about me <ArrowIcon /></a>
	</section>
</div>

<style>
	.home-page { width: min(100% - 32px, 1180px); margin: 0 auto; }
	.hero { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; align-items: center; padding: 48px 0 32px; }
	.hero-copy { position: relative; z-index: 1; }
	.eyebrow { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; color: var(--text-muted); font: 500 12px/1.4 var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase; }
	.status-dot { width: 8px; height: 8px; flex: 0 0 auto; border-radius: 50%; background: var(--accent); }
	h1 { margin: 0; font-size: clamp(3.65rem, 17vw, 5.3rem); line-height: 0.94; font-weight: 700; letter-spacing: -0.075em; }
	.hero-word { display: inline-block; opacity: 0; animation: word-rise 400ms var(--ease-spring) var(--word-delay, 0ms) forwards; }
	.hero-word-green { color: var(--accent-hover); }
	.period { color: var(--coral-ink); }
	@keyframes word-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
	.hero-lead { max-width: 540px; margin: 24px 0; color: var(--text-muted); font-size: var(--type-lead); line-height: 1.6; }
	.hero-actions { display: flex; flex-wrap: wrap; gap: 8px; }
	.button { display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-height: 48px; padding: 12px 16px; border: 1px solid transparent; border-radius: var(--radius); font-size: 16px; font-weight: 650; transition: transform var(--duration-ui) var(--ease-spring); }
	.button :global(svg), .text-link :global(svg), .card-footer a :global(svg) { width: 16px; height: 16px; }
	.button:hover { transform: translateY(-2px); text-decoration: none; }
	.button-primary { background: var(--accent); color: white; }
	.button-primary:hover { background: var(--accent-hover); color: white; }
	.button-quiet { border-color: var(--border); background: var(--card); color: var(--ink); }
	.button-quiet:hover { border-color: var(--ink); }
	.hero-art { position: relative; width: min(100%, 440px); aspect-ratio: 1 / 0.88; justify-self: center; isolation: isolate; }
	.art-card { position: absolute; width: min(62%, 240px); min-height: 244px; display: flex; flex-direction: column; justify-content: space-between; padding: 20px; border: 1px solid rgba(26, 26, 23, 0.12); border-radius: var(--radius); box-shadow: 0 16px 32px rgba(26, 26, 23, 0.12); color: var(--ink); text-align: left; cursor: grab; touch-action: pan-y; user-select: none; transform: translate(var(--drag-x, 0px), var(--drag-y, 0px)) rotate(var(--angle)); animation: sticker-drop 380ms var(--ease-spring) var(--sticker-delay, 0ms) both; }
	.art-card:active { cursor: grabbing; }
	.card-back { top: 9%; right: 8%; background: var(--ochre); }
	.card-front { bottom: 7%; left: 7%; background: var(--card); }
	@keyframes sticker-drop { from { opacity: 0; transform: translate(var(--drag-x, 0px), -24px) rotate(calc(var(--angle) - 6deg)); } to { opacity: 1; transform: translate(var(--drag-x, 0px), var(--drag-y, 0px)) rotate(var(--angle)); } }
	.art-card:hover:not(:focus-visible) { animation: sticker-wobble 280ms var(--ease-spring) both; }
	@keyframes sticker-wobble { 0%, 100% { transform: translate(var(--drag-x, 0px), var(--drag-y, 0px)) rotate(var(--angle)); } 40% { transform: translate(var(--drag-x, 0px), var(--drag-y, 0px)) rotate(calc(var(--angle) + 3deg)); } 72% { transform: translate(var(--drag-x, 0px), var(--drag-y, 0px)) rotate(calc(var(--angle) - 2deg)); } }
	.card-label { color: #43443d; font: 500 12px/1.4 var(--font-mono); letter-spacing: 0.045em; }
	.card-back strong { margin-top: auto; font: 600 clamp(28px, 3vw, 36px)/0.98 var(--font-display); letter-spacing: -0.06em; }
	.card-back i { display: block; width: 78%; height: 7px; margin-top: 8px; border-radius: 8px; background: rgba(26, 26, 23, 0.2); }
	.card-back i:last-child { width: 48%; }
	.card-front strong { margin: auto 0; font: 700 clamp(30px, 4vw, 44px)/0.98 var(--font-display); letter-spacing: -0.07em; }
	.card-front small { color: var(--text-muted); font-size: 14px; }
	.art-sticker { position: absolute; right: 0; bottom: 6%; display: grid; place-items: center; width: 82px; height: 82px; border-radius: 50%; background: var(--coral); color: var(--ink); text-align: center; font: 700 12px/1.05 var(--font-body); letter-spacing: 0.03em; animation: badge-pop 300ms var(--ease-spring) 350ms both; }
	@keyframes badge-pop { from { opacity: 0; transform: scale(0.76) rotate(-10deg); } to { opacity: 1; transform: scale(1) rotate(6deg); } }
	.focus-line { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 16px; }
	.focus-line > span { font-weight: 600; }
	.focus-line div { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; color: var(--ink); }
	.focus-line b { color: var(--coral-ink); font-size: 18px; }
	.section { padding: 64px 0 0; }
	.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 24px; margin-bottom: 24px; }
	.section-heading .eyebrow { margin-bottom: 8px; }
	.section-heading h2, .maker-section h2 { font-size: clamp(32px, 4vw, 48px); line-height: 1.04; letter-spacing: -0.06em; }
	.text-link { display: inline-flex; gap: 8px; align-items: center; color: var(--accent-hover); font-size: 16px; font-weight: 700; white-space: nowrap; }
	.text-link:hover { text-decoration-thickness: 2px; }
	.experiment-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
	.experiment-card { min-width: 0; overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); transition: transform var(--duration-ui) var(--ease-spring); }
	.experiment-card:hover { transform: translateY(-3px); }
	.preview-link { display: block; overflow: hidden; border-bottom: 1px solid var(--border); }
	.preview-link :global(.project-preview) { transition: transform var(--duration-ui) var(--ease-spring); }
	.experiment-card:hover .preview-link :global(.project-preview) { transform: scale(1.02); }
	.card-content { display: flex; flex-direction: column; align-items: flex-start; min-height: 326px; padding: 24px; }
	.experiment-top { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 16px; }
	.experiment-number { color: var(--text-muted); font: 500 12px/1.3 var(--font-mono); letter-spacing: 0.025em; white-space: nowrap; }
	.category-tag { display: inline-flex; align-items: center; min-height: 28px; padding: 4px 8px; border-radius: 8px; color: var(--accent-hover); background: var(--sprout); font-size: var(--type-tag); font-weight: 700; }
	.category-tag.product { color: var(--ink); background: var(--coral); }
	.experiment-status { display: inline-flex; align-items: center; gap: 8px; min-height: 28px; padding: 4px 8px; border-radius: 8px; background: var(--ochre); color: var(--ink); font-size: var(--type-tag); font-weight: 650; }
	.experiment-status i { width: 7px; height: 7px; border-radius: 50%; background: var(--ink); }
	.experiment-card h3 { margin: 12px 0 8px; font-size: 24px; line-height: 1.1; letter-spacing: -0.045em; }
	.experiment-card h3 a { color: var(--ink); }
	.experiment-card h3 a:hover { color: var(--accent-hover); text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }
	.experiment-lines { display: grid; gap: 8px; width: 100%; }
	.experiment-lines p { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 8px; overflow: hidden; color: var(--text-muted); font-size: 15px; line-height: 1.4; }
	.experiment-lines strong { color: var(--ink); font: 500 12px/1.6 var(--font-mono); text-transform: uppercase; }
	.experiment-lines p span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.focus-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
	.focus-chips span { padding: 5px 8px; border: 1px solid var(--border); border-radius: 8px; color: #43443d; background: #f8f4ec; font-size: 13px; line-height: 1.3; }
	.card-footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; width: 100%; margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border); }
	.card-footer time { color: var(--text-muted); font: 500 12px/1.4 var(--font-mono); white-space: nowrap; }
	.card-footer a { display: inline-flex; align-items: center; gap: 6px; color: var(--accent-hover); font-size: 16px; font-weight: 700; white-space: nowrap; }
	.card-footer a:hover { text-decoration: underline; }
	.blog-section { padding-top: 72px; }
	.blog-list { border-top: 1px solid var(--border); }
	.blog-row { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; align-items: center; padding: 24px 8px; border-bottom: 1px solid var(--border); color: inherit; transition: transform var(--duration-ui) var(--ease-spring), opacity var(--duration-ui) ease; }
	.blog-row:hover { transform: translateX(4px); text-decoration: none; }
	.blog-row-meta { grid-column: 1 / span 3; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: var(--text-muted); font: 500 12px/1.4 var(--font-mono); }
	.language-tag { padding: 3px 6px; border-radius: 6px; background: var(--sprout); color: var(--accent-hover); font-size: 12px; font-weight: 600; }
	.read-time { white-space: nowrap; }
	.blog-row-copy { grid-column: 4 / span 8; display: grid; gap: 4px; }
	.blog-row-copy strong { color: var(--ink); font: 600 20px/1.2 var(--font-display); }
	.blog-row-copy small { overflow: hidden; color: var(--text-muted); font-size: 16px; text-overflow: ellipsis; white-space: nowrap; }
	.row-arrow { grid-column: 12; justify-self: end; color: var(--accent-hover); transition: transform var(--duration-ui) var(--ease-spring); }
	.row-arrow :global(svg) { width: 18px; height: 18px; }
	.blog-row:hover .row-arrow { transform: translate(2px, -2px); }
	.blog-empty { padding: 20px 0; color: var(--text-muted); }
	.maker-section { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 24px; align-items: center; margin: 72px 0 0; padding: 24px; border: 1px solid #b6d39c; border-radius: var(--radius); background: var(--sprout); }
	.maker-mark { display: grid; place-items: center; width: 64px; height: 64px; border-radius: var(--radius); background: var(--accent); color: white; font: 700 30px/1 var(--font-display); letter-spacing: -0.08em; }
	.maker-mark { grid-column: 1; }
	.maker-section > div:nth-child(2) { grid-column: 2 / span 7; }
	.maker-section .eyebrow { margin-bottom: 8px; color: var(--accent-hover); }
	.maker-section h2 { font-size: 32px; }
	.maker-section p:not(.eyebrow) { max-width: 620px; margin-top: 8px; color: #34372f; font-size: 17px; line-height: 1.5; }
	.button-dark { grid-column: 9 / span 4; color: var(--paper); background: var(--ink); }
	.button-dark:hover { color: var(--paper); background: #30302a; }
	.mobile-break { display: block; }
	:global(.reveal.reveal-ready) { opacity: 0; transform: translateY(16px); transition: opacity 320ms var(--ease-spring) var(--delay, 0ms), transform 320ms var(--ease-spring) var(--delay, 0ms); }
	:global(.reveal.is-visible) { opacity: 1; transform: translateY(0); }
	@media (min-width: 640px) {
		.home-page { width: min(100% - 48px, 1180px); }
		.hero { gap: 16px; padding: 56px 0 40px; }
		h1 { font-size: var(--type-hero-desktop); }
		.hero-art { width: min(100%, 440px); }
		.experiment-grid { grid-template-columns: repeat(12, minmax(0, 1fr)); }
		.experiment-card { grid-column: span 6; }
		.card-content { min-height: 330px; }
		.maker-section { padding: 32px; }
		.mobile-break { display: none; }
	}
	@media (min-width: 960px) {
		.hero { min-height: 580px; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: 24px; padding: 64px 0 48px; }
		.hero-copy { grid-column: 1 / span 7; }
		.hero-art { grid-column: 8 / span 5; justify-self: end; width: min(100%, 460px); }
		.experiment-card { grid-column: span 4; }
		.card-content { min-height: 348px; }
	}
	@media (min-width: 640px) and (max-width: 959px) {
		.maker-section { grid-template-columns: auto minmax(0, 1fr); gap: 24px; }
		.maker-section > div:nth-child(2) { grid-column: 2; }
		.button-dark { grid-column: 2; justify-self: start; }
	}
	@media (max-width: 639px) {
		.hero-actions { flex-direction: column; align-items: stretch; }
		.hero-actions .button { justify-content: space-between; }
		.hero-art { width: min(100%, 380px); margin: 12px auto 0; }
		.art-card { width: 62%; min-height: 210px; padding: 16px; }
		.card-back strong { font-size: 28px; }
		.card-front strong { font-size: 32px; }
		.art-sticker { right: 0; bottom: 5%; width: 68px; height: 68px; font-size: 12px; }
		.focus-line { align-items: flex-start; flex-direction: column; padding: 16px 0; font-size: 15px; }
		.focus-line div { gap: 8px; font-size: 16px; }
		.section { padding-top: 48px; }
		.section-heading { align-items: flex-start; flex-direction: column; gap: 12px; margin-bottom: 16px; }
		.section-heading h2 { font-size: 36px; }
		.card-content { min-height: 0; padding: 16px; }
		.experiment-card h3 { font-size: 22px; }
		.experiment-lines p { grid-template-columns: 72px minmax(0, 1fr); font-size: 16px; }
		.focus-chips { margin: 12px 0; }
		.card-footer { align-items: flex-start; flex-direction: column; gap: 8px; }
		.blog-row { grid-template-columns: minmax(0, 1fr) 24px; gap: 8px 12px; padding: 16px 4px; }
		.blog-row-meta { grid-column: 1; grid-row: 1; gap: 8px; }
		.blog-row-copy { grid-column: 1; grid-row: 2; }
		.blog-row-copy strong { font-size: 18px; }
		.blog-row-copy small { display: -webkit-box; white-space: normal; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
		.row-arrow { grid-column: 2; grid-row: 1 / 3; }
		.maker-section { grid-template-columns: auto minmax(0, 1fr); margin-top: 48px; gap: 16px; padding: 16px; }
		.maker-mark { grid-column: 1; }
		.maker-section > div:nth-child(2) { grid-column: 2; }
		.maker-mark { width: 48px; height: 48px; font-size: 24px; }
		.maker-section h2 { font-size: 26px; }
		.maker-section p:not(.eyebrow) { font-size: 17px; }
		.button-dark { grid-column: 1 / -1; justify-self: stretch; }
	}
	@media (pointer: coarse) {
		.art-card:active { animation: sticker-wobble 280ms var(--ease-spring) both; }
	}
	@media (prefers-reduced-motion: reduce) {
		.hero-word, .art-card, .art-sticker { animation: none; opacity: 1; transform: none; }
		:global(.reveal.reveal-ready) { opacity: 1; transform: none; transition: none; }
	}
</style>
