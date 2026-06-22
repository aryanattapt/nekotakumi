import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { posts } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";

export async function load({ params, setHeaders }) {
	const [post] = await db
		.select()
		.from(posts)
		.where(and(eq(posts.slug, params.slug), eq(posts.published, true)))
		.limit(1);

	if (!post) throw error(404, "Post not found");

	setHeaders({
		"cache-control": "public, max-age=120, stale-while-revalidate=600"
	});

	return { post };
}
