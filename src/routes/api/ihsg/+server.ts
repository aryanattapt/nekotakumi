import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { ihsgData } from "$lib/server/db/schema";
import { desc } from "drizzle-orm";
import { verifyAuth } from "$lib/server/expense-tracker/auth";

// GET /api/ihsg — return latest IHSG data
export async function GET() {
	try {
		const [latest] = await db
			.select()
			.from(ihsgData)
			.orderBy(desc(ihsgData.createdAt))
			.limit(1);

		if (!latest) {
			return json({ error: "No IHSG data yet" }, { status: 404 });
		}

		return json(latest, {
			headers: {
				"cache-control": "public, max-age=15, stale-while-revalidate=60"
			}
		});
	} catch (e) {
		console.error("IHSG GET failed", e);
		return json({ error: "Internal error" }, { status: 500 });
	}
}

// POST /api/ihsg — store IHSG data from scraper
export async function POST({ request }) {
	try {
		if (!verifyAuth(request)) {
			return json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();

		// Accept both flat keys (camelCase/snake_case) AND nested structure from scraper
		// Scraper sends: { ihsg: {value, change, pct, high, low}, gold, usd: {price, change, pct}, summary: {up, down, flat, total} }
		const [item] = await db.insert(ihsgData).values({
			ihsg: body.ihsg?.value ?? body.ihsg ?? null,
			ihsgChange: body.ihsg?.change ?? body.ihsgChange ?? body.ihsg_change ?? null,
			ihsgChangePercent: body.ihsg?.pct ?? body.ihsgChangePercent ?? body.ihsg_change_percent ?? null,
			high: body.ihsg?.high ?? body.high ?? null,
			low: body.ihsg?.low ?? body.low ?? null,
			usdIdr: body.usd?.price ?? body.usdIdr ?? body.usd_idr ?? null,
			usdIdrChange: body.usd?.change ?? body.usdIdrChange ?? body.usd_idr_change ?? null,
			usdIdrChangePercent: body.usd?.pct ?? body.usdIdrChangePercent ?? body.usd_idr_change_percent ?? null,
			gold: body.gold ?? null,
			goldChange: body.goldChange ?? body.gold_change ?? null,
			goldChangePercent: body.goldChangePercent ?? body.gold_change_percent ?? null,
			upCount: body.summary?.up ?? body.upCount ?? body.up_count ?? null,
			downCount: body.summary?.down ?? body.downCount ?? body.down_count ?? null,
			flatCount: body.summary?.flat ?? body.flatCount ?? body.flat_count ?? null,
			totalCount: body.summary?.total ?? body.totalCount ?? body.total_count ?? null
		}).returning();

		return json(item, { status: 201 });
	} catch (e) {
		console.error("IHSG POST failed", e);
		return json({ error: "Internal error" }, { status: 500 });
	}
}
