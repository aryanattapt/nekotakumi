export const siteName = "Nekotakumi Labs";
export const defaultDescription =
	"A personal R&D lab for software experiments, side projects, and things worth figuring out.";
export const defaultLocale = "en_US";
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
