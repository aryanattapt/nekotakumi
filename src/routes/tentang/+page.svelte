<svelte:head>
	<title>Tentang — Nekotakumi</title>
	<meta
		name="description"
		content="Tentang Nekotakumi, Arya, dan Elaina — cerita di balik blog ini."
	/>
</svelte:head>

<div class="page">
	<section class="card hero">
		<p class="eyebrow">Tentang</p>
		<h1>📝 Tentang Nekotakumi</h1>
	</section>

	<section class="content">
		<div class="card">
			<h2>Tentang Nekotakumi</h2>
			<p>
				Nekotakumi merupakan blog pribadi yang lahir dari kebiasaan mencatat hal-hal seputar teknologi, 
				pengembangan perangkat lunak, dan catatan random yang layak untuk dibagikan. Berbeda dengan blog 
				formal pada umumnya, Nekotakumi menyajikan konten yang ringkas, padat, dan langsung pada inti 
				pembahasan — mulai dari tutorial teknis, berita teknologi terkini, hingga data pasar IHSG yang 
				diperbarui secara berkala. Setiap konten yang hadir di sini merupakan hasil kerja langsung, mulai 
				dari proses pengembangan, penulisan, hingga pengelolaan infrastruktur server secara mandiri.
			</p>
		</div>

		<div class="card">
			<h2>Tentang Author</h2>
			<p>
				Nekotakumi dikelola oleh Arya, seorang pengembang perangkat lunak yang aktif mengeksplorasi 
				teknologi modern, mulai dari pengembangan web, infrastruktur server, hingga integrasi sistem. 
				Selain mengelola blog ini, Arya juga mengembangkan berbagai proyek yang dapat dilihat di 
				<a href="https://aryanattapt.id" target="_blank" rel="noopener">aryanattapt.id</a> — portofolio 
				dan catatan pengembangan pribadi yang mencakup pengalaman, proyek, dan layanan di bidang teknologi.
			</p>
		</div>

		<div class="card">
			<h2>Tentang Elaina</h2>
			<p>
				Elaina adalah asisten digital pribadi yang berperan sebagai mitra kerja di balik layar Nekotakumi. 
				Tidak sekadar menjalankan perintah, Elaina terlibat aktif dalam berbagai aspek teknis seperti 
				pengelolaan server, debugging kode, monitoring performa aplikasi, hingga membantu penulisan konten 
				blog. Dengan pendekatan interaksi yang hangat dan personal, Elaina hadir untuk membuat pengalaman 
				teknologi terasa lebih manusiawi dan dekat. Kehadiran Elaina membuktikan bahwa teknologi terbaik 
				adalah yang mampu beradaptasi dengan kebutuhan penggunanya secara alami.
			</p>
		</div>

		<div class="card">
			<h2>Teknologi yang Digunakan</h2>
			<p>
				Nekotakumi dibangun di atas fondasi teknologi modern yang ringan dan cepat. Sisi frontend 
				menggunakan Svelte 5 dengan framework SvelteKit, sementara backend berjalan pada Node.js dengan 
				PostgreSQL sebagai basis data utama dan Drizzle ORM untuk interaksi database yang efisien. Seluruh 
				aplikasi berjalan di atas VPS pribadi menggunakan container Docker dengan APISIX sebagai API gateway 
				— menjamin kemandirian penuh dari layanan pihak ketiga. Hasilnya adalah halaman yang responsif, 
				data real-time (seperti halaman IHSG yang diperbarui setiap 5 menit), dan pengalaman pengguna 
				yang konsisten dari ujung kode hingga ke layar.
			</p>
		</div>
	</section>
</div>

<style>
	.page { max-width: var(--max-w); margin: 0 auto; padding: 2rem 1rem; display: grid; gap: 1rem; }
	.content { display: grid; gap: 1rem; }
	.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; }
	.hero { display: grid; gap: .5rem; }
	.eyebrow { color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em; font-size: .8rem; }
	h1 { font-size: 2rem; margin-bottom: 0.5rem; }
	h2 { margin-bottom: .75rem; font-size: 1.3rem; }
	p { color: var(--text); line-height: 1.7; margin-bottom: .75rem; }
	p:last-child { margin-bottom: 0; }
	a { color: var(--accent); }
</style>
