import { env } from "$env/dynamic/public";
import { db } from "$lib/server/db";
import { posts } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

function siteUrl(origin: string) {
	return (env.PUBLIC_SITE_URL || origin).replace(/\/+$/, "");
}

function escapeXml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function urlEntry(baseUrl: string, path: string, lastmod?: Date | string | null, priority = "0.7") {
	const modified = lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : "";

	return [
		"<url>",
		`<loc>${escapeXml(`${baseUrl}${path}`)}</loc>`,
		modified,
		`<priority>${priority}</priority>`,
		"</url>"
	].join("");
}

export async function GET({ url }) {
	const baseUrl = siteUrl(url.origin);
	const blogPosts = await db
		.select({ slug: posts.slug, updatedAt: posts.updatedAt })
		.from(posts)
		.where(eq(posts.published, true));

	const staticRoutes = [
		urlEntry(baseUrl, "/", null, "1.0"),
		urlEntry(baseUrl, "/tentang", null, "0.6")
	];

	const blogRoutes = blogPosts.map((post) =>
		urlEntry(baseUrl, `/blog/${post.slug}`, post.updatedAt, "0.8")
	);

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>` +
			`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
			[...staticRoutes, ...blogRoutes].join("") +
			`</urlset>`,
		{
			headers: {
				"Content-Type": "application/xml; charset=utf-8",
				"Cache-Control": "public, max-age=300, stale-while-revalidate=3600"
			}
		}
	);
}
