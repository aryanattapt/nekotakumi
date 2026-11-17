<script lang="ts">
	import { page } from '$app/state';

	let { error, status } = $props();

	let isNotFound = $derived(status === 404);
	let currentPath = $derived(page.url.pathname);
</script>

<svelte:head>
	<title>{status} - Nekotakumi</title>
	<meta
		name="description"
		content={isNotFound ? 'This page could not be found at Nekotakumi Labs.' : 'Something went wrong while loading this page.'}
	/>
</svelte:head>

<div class="error-page">
	<section class="card">
		<div class="badge">{status}</div>
			<h1>{isNotFound ? 'Page not found' : 'Something went wrong'}</h1>
		<p class="lead">
			{#if isNotFound}
				The page <strong>{currentPath}</strong> isn’t here. It may have moved or the link may be old.
			{:else}
				There was a problem opening this page. Try again in a moment or head back home.
			{/if}
		</p>

		<div class="actions">
			<a href="/" class="primary">Back home</a>
			<a href="/blog" class="secondary">Browse the blog</a>
		</div>

		{#if error?.message}
			<details class="details">
				<summary>Error details</summary>
				<pre>{error.message}</pre>
			</details>
		{/if}
	</section>
</div>

<style>
	.error-page {
		position: relative;
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 2rem 1rem;
		overflow: hidden;
		background: var(--paper);
	}

	.card {
		position: relative;
		z-index: 1;
		width: min(100%, 720px);
		padding: clamp(1.5rem, 4vw, 3rem);
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--card);
		box-shadow: var(--shadow-soft);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.75rem;
		border-radius: 8px;
		background: var(--sprout);
		color: var(--accent-hover);
		font-size: 0.8125rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-bottom: 1rem;
	}

	h1 {
		font-size: clamp(2rem, 5vw, 4rem);
		line-height: 0.98;
		margin-bottom: 0.9rem;
	}

	.lead {
		color: var(--text-muted, #6b7280);
		font-size: 1.0625rem;
		line-height: 1.7;
		max-width: 62ch;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.primary,
	.secondary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.85rem 1.1rem;
		border-radius: var(--radius);
		font-weight: 700;
		text-decoration: none;
		transition: transform var(--duration-ui) var(--ease-spring);
	}

	.primary {
		background: var(--accent);
		color: #fff;
	}

	.secondary {
		border: 1px solid var(--border, #e5e7eb);
		background: var(--card);
		color: var(--text);
	}

	.primary:hover,
	.secondary:hover {
		transform: translateY(-1px);
		text-decoration: none;
	}

	.details {
		margin-top: 1.25rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border, #e5e7eb);
	}

	.details summary {
		cursor: pointer;
		font-weight: 700;
	}

	.details pre {
		margin-top: 0.75rem;
		padding: 0.9rem;
		border-radius: var(--radius);
		background: #0f172a;
		color: #e2e8f0;
		overflow: auto;
	}

	@media (max-width: 640px) {
		.card {
			padding: 1.25rem;
			border-radius: var(--radius);
		}

		.actions {
			flex-direction: column;
		}

		.primary,
		.secondary {
			width: 100%;
		}
	}
</style>
