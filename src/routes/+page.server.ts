import { redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';

export async function load({ url, setHeaders }) {
	// Preserve links and bookmarks created when the blog archive lived at the root.
	if (url.searchParams.has('q') || url.searchParams.has('page') || url.searchParams.has('limit')) {
		redirect(308, `/blog${url.search}`);
	}

	try {
		const latestPosts = await db
			.select({ title: posts.title, slug: posts.slug, excerpt: posts.excerpt, createdAt: posts.createdAt })
			.from(posts)
			.where(eq(posts.published, true))
			.orderBy(desc(posts.createdAt))
			.limit(3);

		setHeaders({ 'cache-control': 'public, max-age=60, stale-while-revalidate=300' });
		return { posts: latestPosts };
	} catch (error) {
		console.error('homepage load failed', error);
		return { posts: [] };
	}
}
