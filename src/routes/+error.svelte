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
		content={isNotFound ? 'Halaman tidak ditemukan di Nekotakumi.' : 'Terjadi kesalahan saat memuat halaman Nekotakumi.'}
	/>
</svelte:head>

<div class="error-page">
	<div class="orb orb-one"></div>
	<div class="orb orb-two"></div>

	<section class="card">
		<div class="badge">{status}</div>
		<h1>{isNotFound ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan'}</h1>
		<p class="lead">
			{#if isNotFound}
				Maaf, halaman <strong>{currentPath}</strong> tidak tersedia atau sudah dipindahkan.
			{:else}
				Ada kendala saat membuka halaman ini. Coba kembali sebentar lagi atau kembali ke beranda.
			{/if}
		</p>

		<div class="actions">
			<a href="/" class="primary">Kembali ke beranda</a>
			<a href="/tech-news" class="secondary">Lihat tech news</a>
		</div>

		{#if error?.message}
			<details class="details">
				<summary>Detail error</summary>
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
		background:
			radial-gradient(circle at top left, rgba(124, 58, 237, 0.18), transparent 34%),
			radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.16), transparent 28%),
			linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
	}

	.orb {
		position: absolute;
		border-radius: 999px;
		filter: blur(6px);
		opacity: 0.55;
		pointer-events: none;
	}

	.orb-one {
		top: 8%;
		left: 8%;
		width: 160px;
		height: 160px;
		background: rgba(124, 58, 237, 0.22);
	}

	.orb-two {
		right: 8%;
		bottom: 10%;
		width: 220px;
		height: 220px;
		background: rgba(14, 165, 233, 0.18);
	}

	.card {
		position: relative;
		z-index: 1;
		width: min(100%, 720px);
		padding: clamp(1.5rem, 4vw, 3rem);
		border-radius: 1.5rem;
		border: 1px solid rgba(148, 163, 184, 0.25);
		background: rgba(255, 255, 255, 0.8);
		box-shadow: 0 30px 80px rgba(15, 23, 42, 0.12);
		backdrop-filter: blur(18px);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--accent) 12%, white);
		color: var(--accent);
		font-size: 0.78rem;
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
		font-size: 1.02rem;
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
		border-radius: 999px;
		font-weight: 700;
		text-decoration: none;
		transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
	}

	.primary {
		background: var(--accent);
		color: #fff;
		box-shadow: 0 16px 34px rgba(124, 58, 237, 0.28);
	}

	.secondary {
		border: 1px solid var(--border, #e5e7eb);
		background: rgba(255, 255, 255, 0.88);
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
		border-radius: 0.9rem;
		background: #0f172a;
		color: #e2e8f0;
		overflow: auto;
	}

	@media (max-width: 640px) {
		.card {
			padding: 1.25rem;
			border-radius: 1.25rem;
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
