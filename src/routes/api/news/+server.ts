import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { news } from "$lib/server/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";

// GET /api/news — list news, optional ?category=tech&q=keyword&page=1&limit=20
export async function GET({ url }) {
	const category = url.searchParams.get("category");
	const q = url.searchParams.get("q") || "";
	const page = parseInt(url.searchParams.get("page") || "1", 10);
	const limit = parseInt(url.searchParams.get("limit") || "50", 10);
	const offset = (page - 1) * limit;

	let query = db.select().from(news);
	let countQuery = db.select({ count: sql<number>`count(*)` }).from(news);

	if (category) {
		query = query.where(eq(news.category, category));
		countQuery = countQuery.where(eq(news.category, category));
	}

	if (q) {
		const filter = or(ilike(news.title, `%${q}%`), ilike(news.excerpt, `%${q}%`));
		query = query.where(filter);
		countQuery = countQuery.where(filter);
	}

	const items = await query.orderBy(desc(news.publishedAt)).limit(limit).offset(offset);
	const countResult = await countQuery;
	const total = Number(countResult[0]?.count || 0);
	const totalPages = Math.ceil(total / limit);

	return json({ items, page, totalPages, q, total });
}

// POST /api/news — create news article
export async function POST({ request }) {
	const body = await request.json();
	const { title, slug, content, excerpt, sourceUrl, sourceName, imageUrl, category, publishedAt } = body;

	if (!title || !slug || !content) {
		return json({ error: "title, slug, content required" }, { status: 400 });
	}

	// Check duplicate by slug
	const existing = await db.select().from(news).where(eq(news.slug, slug)).limit(1);
	if (existing.length) {
		return json({ error: "Duplicate slug" }, { status: 409 });
	}

	const [item] = await db.insert(news).values({
		title,
		slug,
		content,
		excerpt: excerpt || null,
		sourceUrl: sourceUrl || null,
		sourceName: sourceName || null,
		imageUrl: imageUrl || null,
		category: category || "general",
		publishedAt: publishedAt ? new Date(publishedAt) : new Date()
	}).returning();

	return json(item, { status: 201 });
}
