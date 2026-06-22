import { db } from "$lib/server/db";
import { news } from "$lib/server/db/schema";
import { desc, eq, sql } from "drizzle-orm";

const PER_PAGE = 20;

export async function load() {
	try {
		const items = await db.select().from(news).where(eq(news.category, "tech")).orderBy(desc(news.publishedAt)).limit(PER_PAGE).offset(0);

		const countResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(news)
			.where(eq(news.category, "tech"));

		const total = Number(countResult[0]?.count || 0);
		const totalPages = Math.ceil(total / PER_PAGE);

		return { items, page: 1, totalPages, q: "", total };
	} catch (error) {
		console.error("tech-news load failed", error);
		return { items: [], page: 1, totalPages: 0, q: "", total: 0 };
	}
}
