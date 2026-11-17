<script lang="ts">
	import { page } from '$app/state';
	import ArrowIcon from '$lib/components/ArrowIcon.svelte';
	import ProjectPreview from '$lib/components/ProjectPreview.svelte';
	import { formatProjectDate, type LabProject } from '$lib/projects';
	import { canonicalUrl, jsonLd, ogImageUrl, siteName } from '$lib/seo';

	let { data } = $props<{ data: { project: LabProject } }>();
	let project = $derived(data.project);
</script>

<svelte:head>
	<title>{project.name} — Nekotakumi Labs</title>
	<meta name="description" content={project.description} />
	<link rel="canonical" href={canonicalUrl(page.url, `/experiments/${project.slug}`)} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={`${project.name} — Nekotakumi Labs`} />
	<meta property="og:description" content={project.description} />
	<meta property="og:url" content={canonicalUrl(page.url, `/experiments/${project.slug}`)} />
	<meta property="og:image" content={ogImageUrl(page.url)} />
	<script type="application/ld+json">
		{jsonLd({
			'@context': 'https://schema.org',
			'@type': 'SoftwareApplication',
			name: project.name,
			description: project.description,
			url: canonicalUrl(page.url, `/experiments/${project.slug}`),
			applicationCategory: project.categoryDetail,
			creator: { '@type': 'Person', name: 'Arya' },
			isPartOf: { '@type': 'WebSite', name: siteName, url: canonicalUrl(page.url, '/') }
		})}
	</script>
</svelte:head>

<article class="detail-page">
	<a class="back-link" href="/#experiments"><ArrowIcon direction="left" /> Back to experiments</a>

	<header class="detail-heading">
		<div class="detail-kicker">
			<span class="experiment-number">{project.number} / EXPERIMENT</span>
			<span class="category-tag" class:product={project.category === 'Product'}>{project.categoryDetail}</span>
		</div>
		<h1>{project.name}</h1>
		<p>{project.description}</p>
		<div class="detail-meta">
			<span class="experiment-status"><i></i>{project.status}</span>
			<time datetime={project.updatedAt}>Updated {formatProjectDate(project.updatedAt)}</time>
		</div>
	</header>

	<div class="detail-preview"><ProjectPreview {project} /></div>

	<section class="detail-content" aria-labelledby="experiment-notes">
		<div class="section-heading">
			<p class="eyebrow">The question behind it</p>
			<h2 id="experiment-notes">A small problem, worth exploring.</h2>
		</div>
		<div class="detail-points">
			<div>
				<span class="point-label">Problem</span>
				<p>{project.problem}</p>
			</div>
			<div>
				<span class="point-label">Approach</span>
				<p>{project.approach}</p>
			</div>
		</div>
	</section>

	<section class="detail-focus" aria-label="Areas being explored">
		<div>
			<p class="eyebrow">What I’m exploring</p>
			<div class="focus-chips">
				{#each project.focusAreas as area}<span>{area}</span>{/each}
			</div>
		</div>
		<a class="button button-primary" href={project.githubUrl} target="_blank" rel="noopener noreferrer">
		View on GitHub <ArrowIcon />
		</a>
	</section>
</article>

<style>
	.detail-page { width: min(100% - 32px, 1000px); margin: 0 auto; padding: 32px 0 24px; }
	.back-link { display: inline-flex; align-items: center; gap: 8px; color: var(--accent-hover); font-size: 15px; font-weight: 650; }
	.detail-heading { max-width: 760px; padding: 48px 0 24px; }
	.detail-kicker { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
	.experiment-number, .detail-meta time { color: var(--text-muted); font: 500 12px/1.4 var(--font-mono); }
	.category-tag { display: inline-flex; align-items: center; min-height: 28px; padding: 4px 8px; border-radius: 8px; color: var(--accent-hover); background: var(--sprout); font-size: var(--type-tag); font-weight: 700; }
	.category-tag.product { color: var(--ink); background: var(--coral); }
	h1 { margin-bottom: 16px; font-size: clamp(42px, 7vw, 76px); line-height: 0.98; letter-spacing: -0.07em; }
	.detail-heading > p { max-width: 650px; color: var(--text-muted); font-size: var(--type-lead); line-height: 1.55; }
	.detail-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; margin-top: 20px; }
	.experiment-status { display: inline-flex; align-items: center; gap: 8px; min-height: 28px; padding: 4px 8px; border-radius: 8px; background: var(--ochre); color: var(--ink); font-size: var(--type-tag); font-weight: 650; }
	.experiment-status i { width: 7px; height: 7px; border-radius: 50%; background: var(--ink); }
	.detail-preview { overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); }
	.detail-preview :global(.project-preview) { padding: clamp(12px, 3vw, 28px); }
	.detail-content { display: grid; gap: 24px; padding: 64px 0 48px; }
	.eyebrow { margin-bottom: 8px; color: var(--text-muted); font: 500 12px/1.4 var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase; }
	.section-heading h2 { max-width: 620px; font-size: clamp(30px, 4vw, 44px); line-height: 1.06; letter-spacing: -0.06em; }
	.detail-points { display: grid; gap: 24px; }
	.detail-points > div { padding-top: 16px; border-top: 1px solid var(--border); }
	.point-label { color: var(--accent-hover); font: 500 12px/1.4 var(--font-mono); letter-spacing: 0.05em; text-transform: uppercase; }
	.detail-points p { max-width: 520px; margin-top: 8px; color: var(--text-muted); font-size: 17px; line-height: 1.6; }
	.detail-focus { display: flex; align-items: end; justify-content: space-between; gap: 24px; padding: 24px; border: 1px solid #b6d39c; border-radius: var(--radius); background: var(--sprout); }
	.detail-focus .eyebrow { color: var(--accent-hover); }
	.focus-chips { display: flex; flex-wrap: wrap; gap: 8px; }
	.focus-chips span { padding: 5px 8px; border: 1px solid rgba(31, 90, 53, 0.2); border-radius: 8px; color: var(--accent-hover); background: rgba(255, 252, 246, 0.56); font-size: 13px; line-height: 1.3; }
	.button { display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-height: 48px; padding: 12px 16px; border-radius: var(--radius); background: var(--accent); color: white; font-size: 16px; font-weight: 650; white-space: nowrap; transition: transform var(--duration-ui) var(--ease-spring); }
	.button:hover { transform: translateY(-2px); background: var(--accent-hover); color: white; text-decoration: none; }
	.button :global(svg) { width: 16px; height: 16px; }
	@media (min-width: 760px) {
		.detail-page { width: min(100% - 48px, 1000px); }
		.detail-content { grid-template-columns: 5fr 7fr; column-gap: 48px; }
		.detail-points { grid-column: 2; grid-row: 1; }
	}
	@media (max-width: 639px) {
		.detail-heading { padding-top: 36px; }
		h1 { font-size: clamp(40px, 12vw, 60px); }
		.detail-heading > p { font-size: 17px; }
		.detail-content { padding: 48px 0 32px; }
		.detail-focus { align-items: stretch; flex-direction: column; padding: 16px; }
		.detail-focus .button { width: 100%; justify-content: space-between; }
	}
</style>
