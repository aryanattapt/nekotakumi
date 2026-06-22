import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function load({ params }) {
	const [post] = await db.select().from(posts).where(eq(posts.slug, params.slug)).limit(1);
	if (!post) error(404, 'Post not found');
	return { post };
}
