import { db } from "$lib/server/db";
import { posts } from "$lib/server/db/schema";
import { desc, sql } from "drizzle-orm";

const PER_PAGE = 10;

export async function load() {
	try {
		const items = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(PER_PAGE).offset(0);

		const countResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(posts);

		const total = Number(countResult[0]?.count || 0);
		const totalPages = Math.ceil(total / PER_PAGE);

		return { posts: items, page: 1, totalPages, q: "", total };
	} catch (error) {
		console.error("homepage load failed", error);
		return { posts: [], page: 1, totalPages: 0, q: "", total: 0 };
	}
}
