<script lang="ts">
	import { page } from "$app/state";
	import { canonicalUrl, jsonLd, ogImageUrl, siteName } from "$lib/seo";

	let { data } = $props();

	type StockRow = {
		symbol: string;
		changePercent: number;
		price: number;
	};

	type SectorRow = {
		name: string;
		value?: number | null;
		change?: number | null;
		changePercent?: number | null;
		stocks?: StockRow[];
	};

	const formatNumber = (value: number | null | undefined, digits = 0) =>
		value === null || value === undefined
			? '-'
			: new Intl.NumberFormat('en-US', {
				minimumFractionDigits: digits,
				maximumFractionDigits: digits
			}).format(value);

	const formatPct = (value: number | null | undefined) =>
		value === null || value === undefined
			? '-'
			: value >= 0
				? '+' + value.toFixed(1) + '%'
				: value.toFixed(1) + '%';

	const changeClass = (value: number | null | undefined) =>
		value === null || value === undefined ? '' : value >= 0 ? 'positive' : 'negative';

	const sectors = $derived(
		((data.ihsgData?.sectors ?? data.ihsgData?.sectorBreakdown ?? data.ihsgData?.sector_data ?? []) as SectorRow[]).filter(
			(sector) => sector && sector.name
		)
	);
</script>

<svelte:head>
	<title>IHSG — Nekotakumi Labs</title>
	<meta name="description" content="A snapshot of the Indonesian market, including the IHSG, USD/IDR, gold, and sector data." />
	<meta name="robots" content="noindex, follow" />
	<link rel="canonical" href={canonicalUrl(page.url, "/ihsg")} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="IHSG — Nekotakumi Labs" />
	<meta property="og:description" content="A snapshot of the Indonesian market, including the IHSG, USD/IDR, gold, and sector data." />
	<meta property="og:url" content={canonicalUrl(page.url, "/ihsg")} />
	<meta property="og:image" content={ogImageUrl(page.url)} />
	<meta name="twitter:title" content="IHSG — Nekotakumi Labs" />
	<meta name="twitter:description" content="A snapshot of the Indonesian market, including the IHSG, USD/IDR, gold, and sector data." />
	<meta name="twitter:image" content={ogImageUrl(page.url)} />
	<script type="application/ld+json">
		{jsonLd({
			"@context": "https://schema.org",
			"@type": "Dataset",
			name: "IHSG Market Snapshot",
			description: "IHSG, USD/IDR, gold, and Indonesian market sector data.",
			url: canonicalUrl(page.url, "/ihsg"),
			creator: {
				"@type": "Organization",
				name: siteName
			},
			dateModified: data.lastUpdated ? new Date(data.lastUpdated).toISOString() : undefined
		})}
	</script>
</svelte:head>

<div class="page">
	<div class="hero">
		<h1>IHSG</h1>
		<p class="subtitle">A quick look at the Indonesian market.</p>
	{#if data.lastUpdated}
		<p class="update-time">Last updated {new Date(data.lastUpdated).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} Jakarta time</p>
	{/if}
	</div>

	{#if data.ihsgData === null}
		<div class="empty">Market data is temporarily unavailable.</div>
	{:else}
		<div class="grid">
			<div class="card">
				<div class="label">IHSG</div>
				<div class="value">{formatNumber(data.ihsgData.ihsg, 2)}</div>
				<div class={`change ${changeClass(data.ihsgData.ihsgChange)}`}>
					{formatNumber(data.ihsgData.ihsgChange, 2)} ({formatNumber(data.ihsgData.ihsgChangePercent, 2)}%)
				</div>
			</div>
			<div class="card">
				<div class="label">Gold</div>
				<div class="value">{formatNumber(data.ihsgData.gold, 2)}</div>
				<div class={`change ${changeClass(data.ihsgData.goldChange)}`}>
					{formatNumber(data.ihsgData.goldChange, 2)} ({formatNumber(data.ihsgData.goldChangePercent, 2)}%)
				</div>
			</div>
			<div class="card">
				<div class="label">USD/IDR</div>
				<div class="value">{formatNumber(data.ihsgData.usdIdr, 2)}</div>
				<div class={`change ${changeClass(data.ihsgData.usdIdrChange)}`}>
					{formatNumber(data.ihsgData.usdIdrChange, 2)} ({formatNumber(data.ihsgData.usdIdrChangePercent, 2)}%)
				</div>
			</div>
		</div>

		<section class="sectors">
			<div class="section-head">
				<h2>Sector breakdown</h2>
				<p>Sector data appears when it is available from the data source.</p>
			</div>

			{#if sectors.length}
				<div class="sector-grid">
					{#each sectors as sector}
						{@const stocks = sector.stocks ?? []}
						{@const up = stocks.filter(s => s.changePercent >= 0)}
						{@const down = stocks.filter(s => s.changePercent < 0)}
						{@const topUp = [...up].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3)}
						{@const topDown = [...down].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3)}
						<div class="card sector-card">
							<div class="label">{sector.name}</div>
							<div class="value">{formatNumber(sector.value ?? null, 2)}</div>
							{#if sector.change !== undefined || sector.changePercent !== undefined}
								<div class={`change ${changeClass(sector.change)}`}>
									{formatNumber(sector.change ?? null, 2)} ({formatNumber(sector.changePercent ?? null, 2)}%)
								</div>
							{/if}
							{#if stocks.length}
								<div class="stock-count">
										{up.length} up, {down.length} down
								</div>
								<div class="stock-list">
									{#if topUp.length}
										<div class="stock-row green">
											{#each topUp as s}
												<span class="stock-item">{s.symbol} {formatPct(s.changePercent)}</span>
											{/each}
										</div>
									{/if}
									{#if topDown.length}
										<div class="stock-row red">
											{#each topDown as s}
												<span class="stock-item">{s.symbol} {formatPct(s.changePercent)}</span>
											{/each}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty">No sector data is available yet.</div>
			{/if}
		</section>
	{/if}

	<section class="related-links" aria-label="More from Nekotakumi Labs">
		<a href="/blog">Read the blog</a>
		<a href="/tech-news">Tech News</a>
		<a href="/tentang">About the lab</a>
	</section>
</div>

<style>
	.page { max-width: var(--max-w); margin: 0 auto; padding: 2rem 1rem; }
	.hero { margin-bottom: 1.5rem; }
	h1 { font-size: 2rem; margin-bottom: 0.5rem; }
	.subtitle { color: var(--text-muted); }
	.update-time { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem; }
	.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
	.sectors { margin-top: 1.5rem; display: grid; gap: 1rem; }
	.section-head h2 { margin-bottom: .25rem; }
	.section-head p { color: var(--text-muted); }
	.sector-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
	.card, .empty { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; }
	.label { color: var(--text-muted); font-size: .85rem; margin-bottom: .5rem; }
	.value { font-size: 1.5rem; font-weight: 700; margin-bottom: .35rem; }
	.change.positive { color: #16a34a; }
	.change.negative { color: #dc2626; }
	.stock-count { margin-top: .75rem; font-size: .85rem; color: var(--text-muted); }
	.stock-list { margin-top: .5rem; display: flex; flex-direction: column; gap: .25rem; }
	.stock-row { display: flex; flex-wrap: wrap; gap: .35rem .75rem; font-size: .8rem; }
	.stock-row.green { color: #16a34a; }
	.stock-row.red { color: #dc2626; }
	.stock-item { white-space: nowrap; }
	.empty { color: var(--text-muted); }
	.related-links { margin-top: 1.5rem; display: flex; gap: .75rem; flex-wrap: wrap; }
	.related-links a { border: 1px solid var(--border); border-radius: 999px; padding: .7rem .95rem; background: var(--bg-card); font-weight: 700; }
	@media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
</style>
