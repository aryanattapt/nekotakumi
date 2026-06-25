import { env } from "$env/dynamic/public";

function siteUrl(origin: string) {
	return (env.PUBLIC_SITE_URL || origin).replace(/\/+$/, "");
}

export function GET({ url }) {
	const baseUrl = siteUrl(url.origin);

	return new Response(
		[
			"User-agent: *",
			"Allow: /",
			"Disallow: /admin/",
			"Disallow: /api/",
			`Sitemap: ${baseUrl}/sitemap.xml`,
			""
		].join("\n"),
		{
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "public, max-age=300, stale-while-revalidate=3600"
			}
		}
	);
}
