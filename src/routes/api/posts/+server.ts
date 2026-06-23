import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { posts } from "$lib/server/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { PAGE_SIZES, getOffset, getTotalPages, normalizeQuery, parseLimit, parsePage } from "$lib/server/listing";
import { verifyAuth } from "$lib/server/expense-tracker/auth";

export async function GET({ url }) {
	const q = normalizeQuery(url.searchParams.get("q"));
	const page = parsePage(url.searchParams.get("page"));
	const limit = parseLimit(url.searchParams.get("limit"), PAGE_SIZES.api);
	const offset = getOffset(page, limit);

	const filters = [eq(posts.published, true)];
	if (q) {
		filters.push(or(ilike(posts.title, `%${q}%`), ilike(posts.excerpt, `%${q}%`)));
	}
	const whereClause = and(...filters);

	const [items, countResult] = await Promise.all([
		db.select().from(posts).where(whereClause).orderBy(desc(posts.createdAt)).limit(limit).offset(offset),
		db.select({ count: sql<number>`count(*)` }).from(posts).where(whereClause)
	]);

	const total = Number(countResult[0]?.count || 0);
	const totalPages = getTotalPages(total, limit);

	return json(
		{ items, page, totalPages, q, total, limit },
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
	const { title, slug, content, excerpt, published } = body;

	if (typeof title !== "string" || typeof slug !== "string" || typeof content !== "string") {
		return json({ error: "title, slug, content required" }, { status: 400 });
	}

	const cleanTitle = title.trim();
	const cleanSlug = slug.trim();
	const cleanContent = content.trim();

	if (!cleanTitle || !cleanSlug || !cleanContent) {
		return json({ error: "title, slug, content required" }, { status: 400 });
	}

	const existing = await db.select().from(posts).where(eq(posts.slug, cleanSlug)).limit(1);
	if (existing.length) {
		return json({ error: "Duplicate slug" }, { status: 409 });
	}

	const [item] = await db
		.insert(posts)
		.values({
			title: cleanTitle,
			slug: cleanSlug,
			content: cleanContent,
			excerpt: typeof excerpt === "string" && excerpt.trim() ? excerpt.trim() : null,
			published: typeof published === "boolean" ? published : false
		})
		.returning();

	return json(item, { status: 201 });
}
