<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import ArrowIcon from '$lib/components/ArrowIcon.svelte';

	let showTop = $state(false);

	function isDetailPage(pathname: string) {
		return (
			(pathname.startsWith('/experiments/') && pathname !== '/experiments') ||
			(pathname.startsWith("/blog/") && pathname !== "/blog") ||
			(pathname.startsWith("/tech-news/") && pathname !== "/tech-news") ||
			(pathname.startsWith("/astronomy-news/") && pathname !== "/astronomy-news")
		);
	}

	function getFallbackPath(pathname: string) {
		if (pathname.startsWith('/experiments/')) return '/#experiments';
		if (pathname.startsWith("/blog/")) return "/blog";
		if (pathname.startsWith("/tech-news/")) return "/tech-news";
		if (pathname.startsWith("/astronomy-news/")) return "/astronomy-news";
		return "/";
	}

	function goBack() {
		const fallback = getFallbackPath(page.url.pathname);
		const referrer = typeof document !== "undefined" ? document.referrer : "";
		const sameOrigin = referrer ? new URL(referrer).origin === page.url.origin : false;

		if (sameOrigin && window.history.length > 1) {
			window.history.back();
			return;
		}

		goto(fallback, { noScroll: true });
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	onMount(() => {
		const updateVisibility = () => {
			showTop = window.scrollY > 260;
		};

		updateVisibility();
		window.addEventListener("scroll", updateVisibility, { passive: true });

		return () => {
			window.removeEventListener("scroll", updateVisibility);
		};
	});
</script>

{#if showTop || isDetailPage(page.url.pathname)}
	<div class="floating-actions" aria-label="Quick actions">
		{#if isDetailPage(page.url.pathname)}
			<button class="fab secondary" type="button" onclick={goBack} aria-label="Go back">
				<ArrowIcon direction="left" size={20} />
			</button>
		{/if}

		{#if showTop}
			<button class="fab primary" type="button" onclick={scrollToTop} aria-label="Back to top">
				<ArrowIcon direction="up" size={20} />
			</button>
		{/if}
	</div>
{/if}

<style>
	.floating-actions {
		position: fixed;
		right: max(12px, env(safe-area-inset-right));
		bottom: max(12px, env(safe-area-inset-bottom));
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		z-index: 50;
	}

	.fab {
		width: 3rem;
		height: 3rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		box-shadow: 0 8px 24px rgba(26, 26, 23, 0.14);
		font-size: 1.25rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform var(--duration-ui) var(--ease-spring);
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.fab:hover {
		transform: translateY(-2px);
	}

	.fab.primary {
		background: var(--accent);
		color: white;
	}

	.fab.secondary {
		background: var(--card);
		color: var(--text);
	}

	@media (max-width: 640px) {
		.floating-actions {
			right: max(12px, env(safe-area-inset-right));
			bottom: max(12px, env(safe-area-inset-bottom));
		}

		.fab {
			width: 48px;
			height: 48px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.fab { transition: none; }
	}
</style>
