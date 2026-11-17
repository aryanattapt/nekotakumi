<script lang="ts">
	import type { LabProject } from '$lib/projects';
	import ArrowIcon from '$lib/components/ArrowIcon.svelte';

	let { project }: { project: LabProject } = $props();
</script>

<div class={`project-preview preview-${project.preview}`} role="img" aria-label={`Illustrative workflow preview for ${project.name}`}>
	<div class="preview-window">
		<div class="preview-bar">
			<span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span>
			<span class="preview-label">ILLUSTRATIVE PREVIEW</span>
			<span class="preview-route">{project.preview === 'research' ? 'research' : project.preview === 'job-search' ? 'workspace' : 'pharmacy'}</span>
		</div>

		{#if project.preview === 'research'}
			<div class="research-screen">
				<aside class="preview-sidebar">
					<span class="mini-brand">takumi<span>.</span></span>
					<span class="side-item active">Research</span>
					<span class="side-item">Sources</span>
					<span class="side-item">Drafts</span>
				</aside>
				<div class="preview-main">
					<span class="mini-kicker">RESEARCH NOTE / 01</span>
					<strong>Start with a question.</strong>
					<div class="source-note"><i></i><span><b>Source note</b><small>Claim linked to a reference</small></span><span class="source-check">linked</span></div>
					<div class="draft-lines"><i></i><i></i><i></i></div>
				</div>
			</div>
		{:else if project.preview === 'job-search'}
			<div class="jobs-screen">
				<div class="jobs-heading"><span class="mini-kicker">APPLICATION WORKSPACE</span><strong>One role, one place.</strong></div>
				<div class="role-card"><span class="role-mark" aria-hidden="true"></span><span><small>ROLE NOTES</small><b>What matters for this role?</b></span><span class="role-arrow"><ArrowIcon /></span></div>
				<div class="role-steps"><span><i>01</i> Research</span><span><i>02</i> Prepare</span><span><i>03</i> Apply</span></div>
			</div>
		{:else}
			<div class="pharmacy-screen">
				<div class="shop-heading"><span class="mini-kicker">FARMAGO / ORDER FLOW</span><span class="shop-status">IN PROGRESS</span></div>
				<div class="pharmacy-content">
					<div class="product-placeholder"><span class="product-shape" aria-hidden="true"></span><span class="product-lines"><i></i><i></i><i></i></span></div>
					<div class="review-card"><small>ORDER STEP</small><strong>Prescription review</strong><span>Pharmacy selection <b><ArrowIcon direction="right" /></b> Delivery</span></div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.project-preview { width: 100%; aspect-ratio: 16 / 10; overflow: hidden; padding: 12px; background: #e9e2d5; }
	.preview-window { width: 100%; height: 100%; overflow: hidden; border: 1px solid #d9d2c5; border-radius: 8px; background: var(--card); color: var(--ink); box-shadow: 0 4px 12px rgba(26, 26, 23, 0.08); }
	.preview-bar { display: flex; align-items: center; gap: 10px; height: 30px; padding: 0 10px; border-bottom: 1px solid #e5ded2; background: #fffcf6; }
	.window-dots { display: inline-flex; gap: 4px; }
	.window-dots i { width: 6px; height: 6px; border-radius: 50%; background: #b8b1a4; }
	.preview-label, .preview-route, .mini-kicker { color: #56564f; font: 500 12px/1.2 var(--font-mono); letter-spacing: 0.025em; }
	.preview-route { margin-left: auto; }
	.research-screen { display: grid; grid-template-columns: 27% 1fr; height: calc(100% - 30px); }
	.preview-sidebar { display: flex; flex-direction: column; gap: 10px; padding: 12px 9px; border-right: 1px solid #e5ded2; background: #f8f4ec; }
	.mini-brand { margin-bottom: 8px; color: var(--ink); font: 600 13px var(--font-display); }
	.mini-brand span { color: var(--accent); }
	.side-item { padding: 5px 6px; border-radius: 6px; color: #56564f; font-size: 12px; }
	.side-item.active { background: var(--sprout); color: var(--accent-hover); font-weight: 700; }
	.preview-main { display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; }
	.preview-main > strong, .jobs-heading > strong { font: 600 clamp(14px, 1.35vw, 20px)/1.15 var(--font-display); letter-spacing: -0.04em; }
	.source-note { display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid #d9d2c5; border-radius: 8px; background: #fffcf6; }
	.source-note > i { width: 7px; height: 7px; flex: 0 0 auto; border-radius: 50%; background: var(--accent); }
	.source-note > span:nth-child(2) { display: grid; gap: 2px; color: var(--ink); font-size: 12px; }
	.source-note small { color: #56564f; font-size: 12px; }
	.source-check { margin-left: auto; color: var(--accent-hover); font: 500 12px var(--font-mono); }
	.draft-lines, .product-lines { display: grid; gap: 5px; }
	.draft-lines i, .product-lines i { height: 4px; border-radius: 8px; background: #ddd6ca; }
	.draft-lines i:first-child { width: 91%; }
	.draft-lines i:nth-child(2) { width: 74%; }
	.draft-lines i:last-child { width: 59%; }
	.jobs-screen { display: flex; flex-direction: column; gap: 12px; height: calc(100% - 30px); padding: 14px 16px; }
	.jobs-heading { display: grid; gap: 5px; }
	.role-card { display: flex; align-items: center; gap: 9px; padding: 9px; border: 1px solid #d9d2c5; border-radius: 8px; background: #fffcf6; }
	.role-mark { position: relative; display: grid; place-items: center; width: 28px; height: 28px; flex: 0 0 auto; border-radius: 8px; background: var(--sprout); }
	.role-mark::before { content: ''; width: 9px; height: 9px; border: 1.5px solid var(--accent-hover); border-radius: 50%; }
	.role-mark::after { content: ''; position: absolute; bottom: 5px; width: 13px; height: 6px; border: 1.5px solid var(--accent-hover); border-radius: 9px 9px 5px 5px; }
	.role-card > span:nth-child(2) { display: grid; gap: 2px; }
	.role-card small, .review-card small { color: #56564f; font: 500 12px var(--font-mono); }
	.role-card b { font-size: 12px; font-weight: 600; }
	.role-arrow { margin-left: auto; color: var(--accent-hover); }
	.role-arrow :global(svg) { width: 16px; height: 16px; }
	.role-steps { display: flex; flex-wrap: wrap; gap: 6px; }
	.role-steps span { display: flex; align-items: center; gap: 5px; padding: 5px 7px; border-radius: 6px; background: #f1ebdf; color: #43443d; font-size: 12px; }
	.role-steps i { color: var(--accent-hover); font: 500 12px var(--font-mono); font-style: normal; }
	.pharmacy-screen { display: flex; flex-direction: column; gap: 12px; height: calc(100% - 30px); padding: 13px 16px; }
	.shop-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
	.shop-status { padding: 4px 6px; border-radius: 6px; background: var(--ochre); color: var(--ink); font: 500 12px var(--font-mono); }
	.pharmacy-content { display: grid; grid-template-columns: 1fr 1.1fr; align-items: center; gap: 10px; }
	.product-placeholder { display: grid; place-items: center; gap: 7px; min-height: 74px; border: 1px solid #e5ded2; border-radius: 8px; background: #f8f4ec; }
	.product-shape { width: 24px; height: 34px; border: 1px solid #8eaf8e; border-radius: 5px 5px 8px 8px; background: #d8e9c8; }
	.product-lines { width: 70%; }
	.product-lines i:first-child { width: 88%; }
	.product-lines i:nth-child(2) { width: 68%; }
	.product-lines i:last-child { width: 44%; }
	.review-card { display: grid; gap: 5px; padding: 9px; border: 1px solid #d9d2c5; border-radius: 8px; background: #fffcf6; }
	.review-card strong { font: 600 clamp(12px, 1.15vw, 16px)/1.15 var(--font-display); }
	.review-card span { color: #56564f; font-size: 12px; }
	.review-card span b { color: var(--accent-hover); display: inline-flex; align-items: center; vertical-align: middle; }
	.review-card span b :global(svg) { width: 14px; height: 14px; }
	:global(.experiment-card:hover) .source-note,
	:global(.experiment-card:hover) .role-card,
	:global(.experiment-card:hover) .review-card { transform: translateX(3px); }
	.source-note, .role-card, .review-card { transition: transform var(--duration-ui) var(--ease-spring); }
	:global(.experiment-card:hover) .draft-lines i { transform: scaleX(1.03); transform-origin: left; }
	.draft-lines i { transition: transform var(--duration-ui) var(--ease-spring); }
	:global(.experiment-card:hover) .product-shape { transform: translateY(-2px); }
	.product-shape { transition: transform var(--duration-ui) var(--ease-spring); }
	@media (max-width: 640px) {
		.project-preview { padding: 8px; }
		.preview-main, .jobs-screen, .pharmacy-screen { padding: 10px; }
		.preview-bar { gap: 6px; padding-inline: 7px; }
		.preview-sidebar { gap: 6px; padding: 8px 6px; }
		.side-item { padding: 4px; }
	}
	@media (prefers-reduced-motion: reduce) {
		.source-note, .role-card, .review-card, .draft-lines i, .product-shape { transition: none; }
	}
</style>
