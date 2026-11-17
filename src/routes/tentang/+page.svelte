<script lang="ts">
	import { page } from '$app/state';
	import ArrowIcon from '$lib/components/ArrowIcon.svelte';
	import { canonicalUrl, jsonLd, ogImageUrl, siteName } from '$lib/seo';

	const description = 'The story behind Nekotakumi Labs: a personal space for software experiments, side projects, and learning by building.';
</script>

<svelte:head>
	<title>About — Nekotakumi Labs</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl(page.url, '/tentang')} />
	<meta property="og:type" content="profile" />
	<meta property="og:title" content="About — Nekotakumi Labs" />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl(page.url, '/tentang')} />
	<meta property="og:image" content={ogImageUrl(page.url)} />
	<meta name="twitter:title" content="About — Nekotakumi Labs" />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImageUrl(page.url)} />
	<script type="application/ld+json">
		{jsonLd({
			'@context': 'https://schema.org',
			'@type': 'AboutPage',
			name: 'About Nekotakumi Labs',
			url: canonicalUrl(page.url, '/tentang'),
			description,
			isPartOf: { '@type': 'WebSite', name: siteName, url: canonicalUrl(page.url, '/') }
		})}
	</script>
</svelte:head>

<div class="about-page">
	<section class="about-hero">
		<p class="eyebrow">A small space for big curiosity</p>
		<h1>Welcome to<br /><span>the lab.</span></h1>
		<p>Nekotakumi Labs is where I try ideas out, build side projects, and write down what I learn along the way.</p>
	</section>

	<section class="about-copy">
		<div class="section-label"><span>01</span><span>Why this exists</span></div>
		<div class="prose">
			<h2>Because “what if?” is a good place to start.</h2>
			<p>I wanted a place to build things that don’t always fit neatly into a work project. Some experiments turn into useful tools. Some need a few more tries. A few are just fun to make. All of them help me learn.</p>
			<p>The name is a reminder to keep the process light. I take the work seriously, but I don’t think every experiment needs to become a startup.</p>
		</div>
	</section>

	<section class="about-copy maker-copy">
		<div class="section-label"><span>02</span><span>The person behind it</span></div>
		<div class="prose">
			<h2>Hi, I’m Arya.</h2>
			<p class="maker-roles">Product Engineer · Business Analysis · Systems Analysis · R&amp;D</p>
			<p>I’ve spent 6+ years in FMCG technology, working across inventory, sales, reporting, and digital payments. I like turning the needs behind those workflows into systems people can use.</p>
			<p>Outside of work, I use this lab for R&amp;D: quick prototypes, AI automation, and small tools that help me learn whether an idea holds up.</p>
			<a class="about-link" href="https://aryanattapt.id/" target="_blank" rel="noopener noreferrer">Visit aryanattapt.id <ArrowIcon /></a>
		</div>
	</section>

	<section class="about-copy elaina-copy">
		<div class="section-label"><span>03</span><span>A helper in the lab</span></div>
		<div class="prose">
			<h2>Meet Elaina.</h2>
			<p>Elaina is my digital assistant for everyday lab work: checking systems, helping with code, and keeping notes moving. She’s part of the setup behind the scenes, while the experiments and decisions stay mine.</p>
		</div>
	</section>

	<section class="about-end">
		<p>Curious about something?</p>
		<a href="/blog">Take a look around the blog <ArrowIcon /></a>
	</section>
</div>

<style>
	.about-page { width: min(100% - 2rem, 940px); margin: 0 auto; padding: 3.7rem 0 1rem; }
	.about-hero { padding: 2rem 0 4.5rem; }
	.eyebrow { margin-bottom: 1rem; color: var(--accent-hover); font-size: 0.76rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
	h1 { font-size: clamp(4rem, 9vw, 7.4rem); line-height: 0.91; letter-spacing: -0.08em; }
	h1 span { color: var(--accent-hover); }
	.about-hero > p:last-child { max-width: 600px; margin-top: 1.4rem; color: var(--text-muted); font-size: 1.125rem; line-height: 1.7; }
	.about-copy { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 2rem; padding: 2.4rem 0; border-top: 1px solid var(--border); }
	.section-label { display: flex; align-items: baseline; gap: 0.65rem; color: var(--text-muted); font-size: 0.82rem; }
	.section-label span:first-child { color: var(--coral); font: 700 0.72rem ui-monospace, monospace; }
	.prose h2 { max-width: 620px; margin-bottom: 0.9rem; font-size: clamp(1.65rem, 3vw, 2.3rem); line-height: 1.15; }
	.maker-roles { margin-bottom: 0.85rem; color: var(--accent-hover); font: 500 12px/1.5 var(--font-mono); letter-spacing: 0.025em; }
	.prose p { max-width: 640px; margin-bottom: 0.85rem; color: var(--text-muted); font-size: 17px; line-height: 1.8; }
	.about-link, .about-end a { display: inline-flex; align-items: center; gap: 0.55rem; margin-top: 0.6rem; color: var(--accent-hover); font-weight: 700; }
	.about-end { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 2.2rem; padding: 1.4rem 1.5rem; border: 1px solid #b6d39c; border-radius: var(--radius); background: var(--sprout); }
	.about-end p { font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 600; }
	.about-end a { margin: 0; }
	@media (max-width: 640px) {
		.about-page { width: min(100% - 1.5rem, 520px); padding-top: 2.8rem; }
		.about-hero { padding: 1.5rem 0 3rem; }
		h1 { font-size: clamp(3.7rem, 19vw, 5.5rem); }
		.about-hero > p:last-child { font-size: 1.03rem; }
		.about-copy { grid-template-columns: 1fr; gap: 0.75rem; padding: 1.8rem 0; }
		.about-end { align-items: flex-start; flex-direction: column; padding: 1.2rem; }
	}
</style>
