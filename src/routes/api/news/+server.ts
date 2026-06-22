import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { news } from "$lib/server/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { PAGE_SIZES, getOffset, getTotalPages, normalizeQuery, parseLimit, parsePage } from "$lib/server/listing";
import { verifyAuth } from "$lib/server/expense-tracker/auth";

export async function GET({ url }) {
	const category = normalizeQuery(url.searchParams.get("category"), 40);
	const q = normalizeQuery(url.searchParams.get("q"));
	const page = parsePage(url.searchParams.get("page"));
	const limit = parseLimit(url.searchParams.get("limit"), PAGE_SIZES.api);
	const offset = getOffset(page, limit);

	const filters = [];
	if (category) filters.push(eq(news.category, category));
	if (q) filters.push(or(ilike(news.title, `%${q}%`), ilike(news.excerpt, `%${q}%`)));
	const whereClause = filters.length ? and(...filters) : undefined;

	const [items, countResult] = await Promise.all([
		db
			.select()
			.from(news)
			.where(whereClause ?? sql`1=1`)
			.orderBy(desc(news.publishedAt))
			.limit(limit)
			.offset(offset),
		db.select({ count: sql<number>`count(*)` }).from(news).where(whereClause ?? sql`1=1`)
	]);

	const total = Number(countResult[0]?.count || 0);
	const totalPages = getTotalPages(total, limit);

	return json(
		{ items, page, totalPages, q, total, category, limit },
		{
			headers: {
				"cache-control": "public, max-age=30, stale-while-revalidate=120"
			}
		}
	);
}

export async function POST({ request }) {
	if (!verifyAuth(request)) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { title, slug, content, excerpt, sourceUrl, sourceName, imageUrl, category, publishedAt } = body;

	if (typeof title !== "string" || typeof slug !== "string" || typeof content !== "string") {
		return json({ error: "title, slug, content required" }, { status: 400 });
	}

	const cleanTitle = title.trim();
	const cleanSlug = slug.trim();
	const cleanContent = content.trim();

	if (!cleanTitle || !cleanSlug || !cleanContent) {
		return json({ error: "title, slug, content required" }, { status: 400 });
	}

	const existing = await db.select().from(news).where(eq(news.slug, cleanSlug)).limit(1);
	if (existing.length) {
		return json({ error: "Duplicate slug" }, { status: 409 });
	}

	const [item] = await db
		.insert(news)
		.values({
			title: cleanTitle,
			slug: cleanSlug,
			content: cleanContent,
			excerpt: typeof excerpt === "string" && excerpt.trim() ? excerpt.trim() : null,
			sourceUrl: typeof sourceUrl === "string" && sourceUrl.trim() ? sourceUrl.trim() : null,
			sourceName: typeof sourceName === "string" && sourceName.trim() ? sourceName.trim() : null,
			imageUrl: typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null,
			category: typeof category === "string" && category.trim() ? category.trim() : "general",
			publishedAt: publishedAt ? new Date(publishedAt) : new Date()
		})
		.returning();

	return json(item, { status: 201 });
}
