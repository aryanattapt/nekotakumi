import { db } from "$lib/server/db";
import { news } from "$lib/server/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { PAGE_SIZES, getOffset, getTotalPages, parseLimit, parsePage } from "$lib/server/listing";

export async function load({ url, setHeaders }) {
	const page = parsePage(url.searchParams.get("page"));
	const limit = parseLimit(url.searchParams.get("limit"), PAGE_SIZES.astronomyNews);
	const offset = getOffset(page, limit);
	const whereClause = and(eq(news.category, "astronomy"));

	try {
		const [items, countResult] = await Promise.all([
			db.select().from(news).where(whereClause).orderBy(desc(news.publishedAt)).limit(limit).offset(offset),
			db.select({ count: sql<number>`count(*)` }).from(news).where(whereClause)
		]);

		const total = Number(countResult[0]?.count || 0);
		const totalPages = getTotalPages(total, limit);

		setHeaders({
			"cache-control": "public, max-age=45, stale-while-revalidate=300"
		});

		return { items, page, totalPages, total, limit };
	} catch (error) {
		console.error("astronomy-news load failed", error);
		return { items: [], page, totalPages: 0, total: 0, limit };
	}
}
