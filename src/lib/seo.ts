export const siteName = "Nekotakumi";
export const defaultDescription =
	"Blog Nekotakumi berisi catatan teknologi, tutorial, berita teknologi, data IHSG, dan tulisan ringan yang cepat dibaca.";
export const defaultLocale = "id_ID";
export const defaultOgImage = "/og-image.png";

export function canonicalUrl(url: URL, pathname = url.pathname) {
	const canonical = new URL(pathname, url.origin);
	return canonical.toString().replace(/\/$/, pathname === "/" ? "/" : "");
}

export function absoluteUrl(url: URL, path?: string | null) {
	if (!path) return undefined;
	return new URL(path, url.origin).toString();
}

export function ogImageUrl(url: URL, path?: string | null) {
	return absoluteUrl(url, path || defaultOgImage);
}

export function jsonLd(data: unknown) {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
