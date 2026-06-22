<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.post.title} - Nekotakumi</title>
</svelte:head>

<div class="page-shell">
	<article class="post">
		<header class="post-header">
			<p class="eyebrow">Blog post</p>
			<h1>{data.post.title}</h1>
			<time>{new Date(data.post.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</time>
		</header>

		<div class="content">
			{@html data.post.content}
		</div>
	</article>

	<div class="back-nav">
		<a href="/" class="back-link">&larr; Kembali ke blog</a>
	</div>
</div>

<style>
	.page-shell {
		max-width: 900px;
		margin: 0 auto;
		padding: 1.25rem 1rem 3rem;
	}

	.post {
		padding: 2rem;
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) * 1.35);
		background:
			radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 40%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(252, 252, 255, 0.94));
		box-shadow: 0 18px 48px rgba(15, 23, 42, 0.07);
	}

	.post-header {
		margin-bottom: 1.75rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--border);
	}

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.18em;
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--accent);
		margin-bottom: 0.75rem;
	}

	h1 {
		font-size: clamp(2rem, 4vw, 3.25rem);
		line-height: 1.05;
		margin-bottom: 0.6rem;
	}

	time {
		display: inline-flex;
		font-size: 0.82rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.content {
		font-size: 1.05rem;
		line-height: 1.8;
	}

	.content :global(p) {
		margin-bottom: 1.15rem;
	}

	.content :global(h2) {
		font-size: 1.45rem;
		margin: 2rem 0 1rem;
	}

	.content :global(h3) {
		font-size: 1.2rem;
		margin: 1.5rem 0 0.7rem;
	}

	.content :global(ul),
	.content :global(ol) {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	.content :global(li) {
		margin-bottom: 0.5rem;
	}

	.back-nav {
		margin-top: 1.25rem;
		text-align: center;
	}

	.back-link {
		display: inline-flex;
		padding: 0.75rem 1rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.9);
		font-weight: 600;
	}

	@media (max-width: 640px) {
		.page-shell {
			padding-inline: 0.75rem;
		}

		.post {
			padding: 1.25rem;
		}
	}
</style>
