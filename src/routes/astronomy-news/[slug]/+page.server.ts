import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { news } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";

export async function load({ params, setHeaders }) {
	const [item] = await db
		.select()
		.from(news)
		.where(and(eq(news.slug, params.slug), eq(news.category, "astronomy")))
		.limit(1);

	if (!item) throw error(404, "Berita tidak ditemukan");

	setHeaders({
		"cache-control": "public, max-age=120, stale-while-revalidate=600"
	});

	return { item };
}
