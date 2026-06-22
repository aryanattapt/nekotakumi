import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/posts/:id
export async function GET({ params }) {
	const id = parseInt(params.id);
	if (isNaN(id)) return json({ error: 'Invalid id' }, { status: 400 });

	const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
	if (!post) return json({ error: 'Not found' }, { status: 404 });
	return json(post);
}

// PUT /api/posts/:id
export async function PUT({ params, request }) {
	const id = parseInt(params.id);
	if (isNaN(id)) return json({ error: 'Invalid id' }, { status: 400 });

	const body = await request.json();
	const { title, slug, content, excerpt, published } = body;

	const [post] = await db.update(posts)
		.set({
			...(title && { title }),
			...(slug && { slug }),
			...(content !== undefined && { content }),
			...(excerpt !== undefined && { excerpt }),
			...(published !== undefined && { published }),
			updatedAt: new Date()
		})
		.where(eq(posts.id, id))
		.returning();

	if (!post) return json({ error: 'Not found' }, { status: 404 });
	return json(post);
}

// DELETE /api/posts/:id
export async function DELETE({ params }) {
	const id = parseInt(params.id);
	if (isNaN(id)) return json({ error: 'Invalid id' }, { status: 400 });

	const [post] = await db.delete(posts).where(eq(posts.id, id)).returning();
	if (!post) return json({ error: 'Not found' }, { status: 404 });
	return json({ message: 'Deleted', post });
}
