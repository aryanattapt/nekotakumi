import { db } from "$lib/server/db";
import { posts } from "$lib/server/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { PAGE_SIZES, getOffset, getTotalPages, normalizeQuery, parseLimit, parsePage } from "$lib/server/listing";

export async function load({ url, setHeaders }) {
	const q = normalizeQuery(url.searchParams.get("q"));
	const page = parsePage(url.searchParams.get("page"));
	const limit = parseLimit(url.searchParams.get("limit"), PAGE_SIZES.blog);
	const offset = getOffset(page, limit);

	const filters = [eq(posts.published, true)];
	if (q) {
		filters.push(or(ilike(posts.title, `%${q}%`), ilike(posts.excerpt, `%${q}%`)));
	}

	const whereClause = and(...filters);

	try {
		const [items, countResult] = await Promise.all([
			db.select().from(posts).where(whereClause).orderBy(desc(posts.createdAt)).limit(limit).offset(offset),
			db.select({ count: sql<number>`count(*)` }).from(posts).where(whereClause)
		]);

		const total = Number(countResult[0]?.count || 0);
		const totalPages = getTotalPages(total, limit);

		setHeaders({
			"cache-control": "public, max-age=60, stale-while-revalidate=300"
		});

		return { posts: items, page, totalPages, q, total, limit };
	} catch (error) {
		console.error("homepage load failed", error);
		return { posts: [], page, totalPages: 0, q, total: 0, limit };
	}
}
