import { db } from "$lib/server/db";
import { news } from "$lib/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function load() {
	try {
		const items = await db
			.select()
			.from(news)
			.where(eq(news.category, "astronomy"))
			.orderBy(desc(news.publishedAt));

		return { items };
	} catch (error) {
		console.error("astronomy-news load failed", error);
		return { items: [] };
	}
}
