import { db } from "$lib/server/db";
import { news } from "$lib/server/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { PAGE_SIZES, getOffset, getTotalPages, normalizeQuery, parseLimit, parsePage } from "$lib/server/listing";

export async function load({ url, setHeaders }) {
	const q = normalizeQuery(url.searchParams.get("q"));
	const page = parsePage(url.searchParams.get("page"));
	const limit = parseLimit(url.searchParams.get("limit"), PAGE_SIZES.techNews);
	const offset = getOffset(page, limit);

	const filters = [eq(news.category, "tech")];
	if (q) {
		filters.push(or(ilike(news.title, `%${q}%`), ilike(news.excerpt, `%${q}%`)));
	}

	const whereClause = and(...filters);

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

		return { items, page, totalPages, q, total, limit };
	} catch (error) {
		console.error("tech-news load failed", error);
		return { items: [], page, totalPages: 0, q, total: 0, limit };
	}
}
