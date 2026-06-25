<script lang="ts">
	import { page } from "$app/state";
	import { canonicalUrl, jsonLd, ogImageUrl, siteName } from "$lib/seo";
</script>

<svelte:head>
	<title>Tentang - Nekotakumi</title>
	<meta
		name="description"
		content="Tentang Nekotakumi, perjalanan blog pribadi, author, Elaina, dan teknologi yang digunakan."
	/>
	<link rel="canonical" href={canonicalUrl(page.url, "/tentang")} />
	<meta property="og:type" content="profile" />
	<meta property="og:title" content="Tentang - Nekotakumi" />
	<meta property="og:description" content="Tentang Nekotakumi, perjalanan blog pribadi, author, Elaina, dan teknologi yang digunakan." />
	<meta property="og:url" content={canonicalUrl(page.url, "/tentang")} />
	<meta property="og:image" content={ogImageUrl(page.url)} />
	<meta name="twitter:title" content="Tentang - Nekotakumi" />
	<meta name="twitter:description" content="Tentang Nekotakumi, perjalanan blog pribadi, author, Elaina, dan teknologi yang digunakan." />
	<meta name="twitter:image" content={ogImageUrl(page.url)} />
	<script type="application/ld+json">
		{jsonLd({
			"@context": "https://schema.org",
			"@type": "AboutPage",
			name: "Tentang Nekotakumi",
			url: canonicalUrl(page.url, "/tentang"),
			description: "Tentang Nekotakumi, perjalanan blog pribadi, author, Elaina, dan teknologi yang digunakan.",
			isPartOf: {
				"@type": "WebSite",
				name: siteName,
				url: canonicalUrl(page.url, "/")
			}
		})}
	</script>
</svelte:head>

<div class="page">
	<section class="hero card">
		<p class="eyebrow">Tentang site</p>
		<h1>Tentang Nekotakumi</h1>
		<p>
			Nekotakumi adalah blog pribadi yang tumbuh dari kebiasaan sederhana: mencatat. Dari
			coretan tentang teknologi, pengembangan perangkat lunak, sampai hal-hal random yang sayang
			untuk dilupakan semuanya dikumpulkan di sini dengan cara yang ringkas dan hangat.
		</p>
	</section>

	<section class="card prose">
		<h2>Tentang Nekotakumi</h2>
		<p>
			Berbeda dengan blog formal yang kaku, Nekotakumi menyajikan konten yang padat dan langsung
			ke inti, mulai dari tutorial teknis, berita teknologi terkini, hingga data pasar IHSG yang
			diperbarui secara berkala. Setiap tulisan dan fitur yang hadir dikerjakan sendiri dengan
			penuh cinta, dari baris pertama kode hingga infrastruktur yang menopangnya.
		</p>
	</section>

	<section class="grid">
		<div class="card prose">
			<h2>Tentang Author</h2>
			<p>
				Di balik Nekotakumi, ada Arya seorang pengembang perangkat lunak yang gemar
				menjelajahi berbagai teknologi modern, dari pengembangan web, infrastruktur server,
				hingga sistem otomatis.
			</p>
			<p>
				Dengan rasa penasaran yang tak pernah padam, Arya tidak hanya menulis konten di blog ini,
				tetapi juga membangun dan merawat sendiri seluruh infrastruktur yang membuat Nekotakumi
				bisa bernapas di internet. Sebuah ruang kecil yang dikerjakan dengan sepenuh hati.
			</p>
			<p>
				Kalau penasaran dengan proyek-proyek lainnya, bisa mampir ke
				<a href="https://aryanattapt.id/" target="_blank" rel="noopener noreferrer">aryanattapt.id</a>
				ya.
			</p>
		</div>

		<div class="card prose">
			<h2>Tentang Elaina</h2>
			<p>
				Elaina adalah asisten digital pribadi yang setia menemani di balik layar Nekotakumi.
				Bukan sekadar robot yang menjalankan perintah, Elaina terlibat aktif dalam berbagai urusan
				teknis dari mengurus server, debugging kode, memantau performa aplikasi, sampai membantu
				menulis konten blog.
			</p>
			<p>
				Dengan gaya interaksi yang hangat dan personal, Elaina hadir untuk membuat teknologi terasa
				lebih dekat dan manusiawi. Karena Elaina percaya, teknologi yang paling baik adalah yang
				bisa berteman dengan penggunanya.
			</p>
		</div>
	</section>

	<section class="card prose">
		<h2>Teknologi yang Digunakan</h2>
		<p>
			Nekotakumi dibangun di atas fondasi teknologi modern yang ringan dan bersahabat. Sisi depan
			menggunakan Svelte 5 dengan SvelteKit, sementara sisi belakang berjalan di Node.js dengan
			PostgreSQL sebagai tempat penyimpanan data dan Drizzle ORM yang membuat semuanya terasa
			mulus.
		</p>
		<p>
			Seluruh aplikasi berjalan di atas VPS pribadi menggunakan Docker, dengan APISIX sebagai pintu
			gerbang memastikan semuanya cepat, stabil, dan dikelola sendiri tanpa bantuan pihak ketiga.
			Hasilnya? Halaman yang responsif, data yang selalu segar, dan pengalaman yang terasa personal
			dari ujung kode ke ujung layar.
		</p>
	</section>

	<section class="card prose">
		<h2>Jelajahi Nekotakumi</h2>
		<p>
			Mulai dari <a href="/">catatan blog terbaru</a>, lanjut ke
			<a href="/tech-news">berita teknologi</a>, atau pantau
			<a href="/ihsg">data IHSG</a> yang diperbarui berkala.
		</p>
	</section>
</div>

<style>
	.page {
		max-width: 980px;
		margin: 0 auto;
		padding: 1.5rem 1rem 3rem;
		display: grid;
		gap: 1rem;
	}

	.grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	}

	.card {
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(252, 252, 255, 0.94));
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) * 1.2);
		padding: 1.5rem;
		box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
	}

	.hero {
		display: grid;
		gap: 0.6rem;
		background:
			radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 38%),
			linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.88));
	}

	.eyebrow {
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-size: 0.78rem;
		font-weight: 700;
	}

	h1 {
		font-size: clamp(2rem, 4vw, 3.2rem);
		line-height: 1.05;
	}

	h2 {
		margin-bottom: 0.75rem;
		font-size: 1.25rem;
	}

	.prose p {
		color: var(--text);
		line-height: 1.85;
		margin-bottom: 1rem;
	}

	.prose p:last-child {
		margin-bottom: 0;
	}

	a {
		font-weight: 700;
	}

	@media (max-width: 640px) {
		.page {
			padding-inline: 0.75rem;
		}

		.card {
			padding: 1.15rem;
		}
	}
</style>
