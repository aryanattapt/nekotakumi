<script lang="ts">
	let { data } = $props();
	let { post } = data;
</script>

<svelte:head>
	<title>{post.title} — Nekotakumi</title>
</svelte:head>

<div class="container">
	<article class="post">
		<header class="post-header">
			<time>{new Date(post.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
			<h1>{post.title}</h1>
		</header>
		<div class="content">
			{@html post.content}
		</div>
	</article>
	<div class="back-nav">
		<a href="/" class="back-link">&larr; Kembali ke blog</a>
	</div>
</div>

<style>
	.container {
		max-width: var(--max-w);
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.post {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 2rem;
	}

	.post-header {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.post-header time {
		font-size: 0.8rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.post-header h1 {
		font-size: 2rem;
		font-weight: 700;
		margin-top: 0.5rem;
		line-height: 1.3;
	}

	.content {
		font-size: 1.05rem;
		line-height: 1.8;
	}

	.content p {
		margin-bottom: 1.25rem;
	}

	.content h2 {
		font-size: 1.5rem;
		margin: 2rem 0 1rem;
	}

	.content h3 {
		font-size: 1.25rem;
		margin: 1.5rem 0 0.75rem;
	}

	.content ul, .content ol {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	.content li {
		margin-bottom: 0.5rem;
	}

	.back-nav {
		margin-top: 2rem;
		text-align: center;
	}

	.back-link {
		font-weight: 500;
	}
</style>
