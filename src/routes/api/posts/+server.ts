import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { posts } from "$lib/server/db/schema";
import { desc, ilike, or, sql } from "drizzle-orm";

export async function GET({ url }) {
	const q = url.searchParams.get("q") || "";
	const page = parseInt(url.searchParams.get("page") || "1", 10);
	const limit = parseInt(url.searchParams.get("limit") || "10", 10);
	const offset = (page - 1) * limit;

	let query = db.select().from(posts);

	if (q) {
		query = query.where(
			or(ilike(posts.title, `%${q}%`), ilike(posts.excerpt, `%${q}%`))
		);
	}

	const items = await query.orderBy(desc(posts.createdAt)).limit(limit).offset(offset);

	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(posts)
		.where(q ? or(ilike(posts.title, `%${q}%`), ilike(posts.excerpt, `%${q}%`)) : sql`1=1`);

	const total = Number(countResult[0]?.count || 0);
	const totalPages = Math.ceil(total / limit);

	return json({ items, page, totalPages, q, total });
}
