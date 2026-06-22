import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { posts } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { verifyAuth } from "$lib/server/expense-tracker/auth";

function parseId(value: string) {
	const id = Number.parseInt(value, 10);
	return Number.isFinite(id) ? id : null;
}

export async function GET({ params, request }) {
	if (!verifyAuth(request)) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	const id = parseId(params.id);
	if (!id) return json({ error: "Invalid id" }, { status: 400 });

	const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
	if (!post) return json({ error: "Not found" }, { status: 404 });
	return json(post);
}

export async function PUT({ params, request }) {
	if (!verifyAuth(request)) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	const id = parseId(params.id);
	if (!id) return json({ error: "Invalid id" }, { status: 400 });

	const body = await request.json();
	const { title, slug, content, excerpt, published } = body;

	const [post] = await db
		.update(posts)
		.set({
			...(typeof title === "string" && title.trim() ? { title: title.trim() } : {}),
			...(typeof slug === "string" && slug.trim() ? { slug: slug.trim() } : {}),
			...(content !== undefined ? { content } : {}),
			...(excerpt !== undefined ? { excerpt } : {}),
			...(published !== undefined ? { published: Boolean(published) } : {}),
			updatedAt: new Date()
		})
		.where(eq(posts.id, id))
		.returning();

	if (!post) return json({ error: "Not found" }, { status: 404 });
	return json(post);
}

export async function DELETE({ params, request }) {
	if (!verifyAuth(request)) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	const id = parseId(params.id);
	if (!id) return json({ error: "Invalid id" }, { status: 400 });

	const [post] = await db.delete(posts).where(eq(posts.id, id)).returning();
	if (!post) return json({ error: "Not found" }, { status: 404 });
	return json({ message: "Deleted", post });
}
