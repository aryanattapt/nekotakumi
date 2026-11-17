<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { onMount } from "svelte";

	let showTop = $state(false);

	function isDetailPage(pathname: string) {
		return (
			(pathname.startsWith("/blog/") && pathname !== "/blog") ||
			(pathname.startsWith("/tech-news/") && pathname !== "/tech-news") ||
			(pathname.startsWith("/astronomy-news/") && pathname !== "/astronomy-news")
		);
	}

	function getFallbackPath(pathname: string) {
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
				<span aria-hidden="true">←</span>
			</button>
		{/if}

		{#if showTop}
			<button class="fab primary" type="button" onclick={scrollToTop} aria-label="Back to top">
				<span aria-hidden="true">↑</span>
			</button>
		{/if}
	</div>
{/if}

<style>
	.floating-actions {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		z-index: 50;
	}

	.fab {
		width: 3rem;
		height: 3rem;
		border-radius: 999px;
		border: 1px solid var(--border);
		box-shadow: 0 16px 36px rgba(15, 23, 42, 0.18);
		backdrop-filter: blur(10px);
		font-size: 1.15rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.fab:hover {
		transform: translateY(-2px);
		box-shadow: 0 20px 40px rgba(15, 23, 42, 0.22);
	}

	.fab.primary {
		background: linear-gradient(135deg, var(--accent), var(--accent-hover));
		color: white;
	}

	.fab.secondary {
		background: rgba(255, 255, 255, 0.92);
		color: var(--text);
	}

	@media (max-width: 640px) {
		.floating-actions {
			right: 0.75rem;
			bottom: 0.75rem;
		}

		.fab {
			width: 2.8rem;
			height: 2.8rem;
		}
	}
</style>
