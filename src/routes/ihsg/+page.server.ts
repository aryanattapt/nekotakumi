import { error } from "@sveltejs/kit";

const YAHOO_HOSTS = ["query2.finance.yahoo.com", "query1.finance.yahoo.com"];

const SECTORS: Record<string, string[]> = {
	"🏦 BANK": ["BBCA", "BBRI", "BMRI", "BBNI", "BRIS", "BJBR", "BJTM", "BBTN", "BNLI", "BDMN", "NISP", "MAYA", "AGRO", "BTPN", "BNGA", "SDRA", "NOBU", "INPC", "PNBN", "ARTO"],
	"📡 TELCO/INFRA": ["TLKM", "EXCL", "ISAT", "JSMR", "TOWR", "TBIG", "MTEL", "CENT", "PJAA", "CMNP", "ADHI", "PTPP", "WSKT", "TOTL", "WEGE", "ACST"],
	"🏭 INDUSTRIAL": ["ASII", "UNTR", "AUTO", "ASGR", "AMFG", "ARNA", "BRPT", "APLN"],
	"⛽ ENERGY": ["ADRO", "ADMR", "MEDC", "PGAS", "PTBA", "ITMG", "HRUM", "BUMI", "RUIS", "MBAP", "PTRO", "WINS", "ELSA", "SMMT", "DSSA", "ENRG", "INDY", "PGEO"],
	"🛒 CONSUMER": ["UNVR", "INDF", "ICBP", "CPIN", "MYOR", "HMSP", "GOTO", "ULTJ", "ROTI", "DLTA", "STTP", "ADES", "MAIN", "CLEO", "KLBF", "SIDO", "JPFA", "ALTO", "BUDI", "CEKA", "PSDN", "COCO"],
	"🏗️ PROPERTY": ["CTRA", "PWON", "BSDE", "LPKR", "LPCK", "DILD", "ASRI", "SMGR", "BIRD", "KREN", "MLPT", "TEBE", "MARK", "WOOD"],
	"⛏️ MINING": ["ANTM", "INCO", "MDKA", "TINS", "AMMN", "BRMS", "CTTH", "DKFT", "GEMS", "MEGA", "EMTK", "AKRA", "ESSA", "AMRT", "TPIA", "AVIA", "SMMA"],
	"💻 TECH": ["MTDL", "BUKA", "DCII", "HYGN", "ATIC", "AWAN", "AXIO", "AREA", "ASLC"],
	"🌾 AGRI": ["AALI", "LSIP", "SMAR", "SGRO", "ANJT", "ANDI", "AGAR", "RALS", "GOOD"],
	"🚪 TRANSPORT": ["ASSA", "AKSI", "CMPP", "SAFE", "PURA"],
	"🏥 RETAIL/HEALTH": ["ACES", "MAPI", "ERAA", "LPPF", "SCMA", "MNCN", "SILO", "HEAL", "MIKA", "NICL", "PNBS", "BTPS"],
	"📦 OTHERS": ["GPRA", "ASLI", "ARII", "APEX", "MITI", "ACRO", "AEGS", "AMAN", "AMMS", "ARKO", "ATLA", "AYAM", "ASHA", "PLAN"]
};

const UA = 'Mozilla/5.0';

// --- In-memory cache ---
let cache: {
	data: {
		ihsg: number | null;
		ihsgChange: number | null;
		ihsgChangePercent: number | null;
		gold: number | null;
		goldChange: number | null;
		goldChangePercent: number | null;
		usdIdr: number | null;
		usdIdrChange: number | null;
		usdIdrChangePercent: number | null;
		sectors: Array<{ name: string; value: number | null; change: number | null; changePercent: number | null; stocks: Array<{ symbol: string; changePercent: number; price: number }> }>;
	};
	ts: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Guard: only one refresh at a time
let refreshInProgress: Promise<void> | null = null;

function sleep(ms: number): Promise<void> {
	return new Promise(r => setTimeout(r, ms));
}

async function fetchJson(url: string, cookie = ""): Promise<any> {
	const headers: Record<string, string> = { "User-Agent": UA };
	if (cookie) headers["Cookie"] = cookie;
	const res = await fetch(url, { headers });
	if (!res.ok) throw new Error(`Yahoo fetch failed: ${res.status} ${res.statusText}`);
	return res.json();
}

async function fetchWithFallback(path: string, cookie = ""): Promise<any> {
	let lastErr: Error | null = null;
	for (const host of YAHOO_HOSTS) {
		try {
			return await fetchJson(`https://${host}${path}`, cookie);
		} catch (e: any) {
			lastErr = e;
			console.warn(`Host ${host} failed:`, e.message);
			await sleep(500);
		}
	}
	throw lastErr || new Error("All Yahoo hosts failed");
}

async function getCrumb(): Promise<{ crumb: string; cookie: string }> {
	const fcRes = await fetch("https://fc.yahoo.com/", {
		headers: { "User-Agent": UA }
	});
	const setCookie = fcRes.headers.get("set-cookie") || "";
	const cookie = setCookie.split(";")[0] || "";

	let lastErr: Error | null = null;
	for (const host of YAHOO_HOSTS) {
		try {
			const crumbRes = await fetch(`https://${host}/v1/test/getcrumb`, {
				headers: { "User-Agent": UA, "Cookie": cookie }
			});
			const crumb = (await crumbRes.text()).trim();
			return { crumb, cookie };
		} catch (e: any) {
			lastErr = e;
			await sleep(500);
		}
	}
	throw lastErr || new Error("All Yahoo hosts failed for crumb");
}

async function refreshCache(): Promise<void> {
	// Deduplicate concurrent refresh calls
	if (refreshInProgress) {
		return refreshInProgress;
	}

	refreshInProgress = (async () => {
		const data = {
			ihsg: null as number | null,
			ihsgChange: null as number | null,
			ihsgChangePercent: null as number | null,
			gold: null as number | null,
			goldChange: null as number | null,
			goldChangePercent: null as number | null,
			usdIdr: null as number | null,
			usdIdrChange: null as number | null,
			usdIdrChangePercent: null as number | null,
			sectors: [] as Array<{ name: string; value: number | null; change: number | null; changePercent: number | null; stocks: Array<{ symbol: string; changePercent: number; price: number }> }>
		};

		try {
			const d = await fetchWithFallback("/v8/finance/chart/%5EJKSE?range=1d&interval=1d");
			const meta = d?.chart?.result?.[0]?.meta;
			const quote = d?.chart?.result?.[0]?.indicators?.quote?.[0];
			const close = quote?.close?.[0] ?? meta?.regularMarketPrice ?? null;
			const prevClose = meta?.chartPreviousClose ?? null;
			data.ihsg = close;
			if (close !== null && prevClose !== null) {
				data.ihsgChange = close - prevClose;
				data.ihsgChangePercent = (data.ihsgChange / prevClose) * 100;
			}
		} catch (e) {
			console.error("IHSG fetch failed:", e);
		}

		await sleep(1000);

		try {
			const d = await fetchWithFallback("/v8/finance/chart/USDIDR=X?range=1d&interval=1d");
			const meta = d?.chart?.result?.[0]?.meta;
			const quote = d?.chart?.result?.[0]?.indicators?.quote?.[0];
			const close = quote?.close?.[0] ?? meta?.regularMarketPrice ?? null;
			const prevClose = meta?.chartPreviousClose ?? null;
			data.usdIdr = close;
			if (close !== null && prevClose !== null) {
				data.usdIdrChange = close - prevClose;
				data.usdIdrChangePercent = (data.usdIdrChange / prevClose) * 100;
			}
		} catch (e) {
			console.error("USD/IDR fetch failed:", e);
		}

		try {
			const r = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json");
			if (r.ok) {
				const j = await r.json();
				data.gold = j?.xau?.usd ?? null;
			}
		} catch (e) {
			console.error("Gold fetch failed:", e);
		}

		await sleep(1000);

		try {
			const { crumb, cookie } = await getCrumb();
			const allSymbols = Object.values(SECTORS).flat();
			const symbolsStr = allSymbols.map(s => s + ".JK").join(",");
			const qd = await fetchWithFallback(
				`/v7/finance/quote?symbols=${symbolsStr}&crumb=${crumb}`,
				cookie
			);
			const results: any[] = qd?.quoteResponse?.result ?? [];

			const priceMap = new Map<string, { price: number; change: number; changePercent: number }>();
			for (const r of results) {
				const sym = r.symbol?.replace(".JK", "");
				if (sym && r.regularMarketPrice != null) {
					priceMap.set(sym, {
						price: r.regularMarketPrice,
						change: r.regularMarketChange ?? 0,
						changePercent: r.regularMarketChangePercent ?? 0
					});
				}
			}

			data.sectors = Object.entries(SECTORS).map(([name, stocks]) => {
				let totalChange = 0, count = 0;
				const stockData: Array<{ symbol: string; changePercent: number; price: number }> = [];
				for (const s of stocks) {
					const d = priceMap.get(s);
					if (d && d.changePercent != null) {
						totalChange += d.changePercent;
						count++;
						stockData.push({ symbol: s, changePercent: d.changePercent, price: d.price });
					}
				}
				const avg = count > 0 ? totalChange / count : null;
				return { name, value: avg, change: avg, changePercent: avg, stocks: stockData };
			});
		} catch (e) {
			console.error("Sector fetch failed:", e);
		}

		cache = { data, ts: Date.now() };
	})();

	try {
		await refreshInProgress;
	} finally {
		refreshInProgress = null;
	}
}

export async function load() {
	// Return cached data if fresh enough
	if (cache && Date.now() - cache.ts < CACHE_TTL) {
		return { ihsgData: cache.data, lastUpdated: cache.ts };
	}

	// Stale cache — return stale + trigger refresh in background
	if (cache) {
		refreshCache().catch(e => console.error("Background cache refresh failed:", e));
		return { ihsgData: cache.data, lastUpdated: cache.ts };
	}

	// No cache yet — wait for first refresh
	await refreshCache();

	return {
		ihsgData: cache?.data ?? {
			lastUpdated: cache?.ts ?? null,
			ihsg: null,
			ihsgChange: null,
			ihsgChangePercent: null,
			gold: null,
			goldChange: null,
			goldChangePercent: null,
			usdIdr: null,
			usdIdrChange: null,
			usdIdrChangePercent: null,
			sectors: []
		}
	};
}
