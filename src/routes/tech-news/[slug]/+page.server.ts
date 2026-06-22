import { db } from "$lib/server/db";
import { news } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
	try {
		const [item] = await db
			.select()
			.from(news)
			.where(and(eq(news.slug, params.slug), eq(news.category, "tech")))
			.limit(1);

		if (!item) {
			error(404, "Berita tidak ditemukan");
		}

		return { item };
	} catch (e) {
		if (e.status === 404) throw e;
		console.error("tech-news detail load failed", e);
		error(500, "Gagal memuat berita");
	}
}
