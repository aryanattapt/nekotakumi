import { describe, expect, it } from 'vitest';
import { absoluteUrl, canonicalUrl, defaultDescription, defaultLocale, jsonLd, ogImageUrl, siteName } from '../../src/lib/seo';

const currentUrl = new URL('https://example.test/blog/post?search=keep-out#section');

describe('site metadata', () => {
	it('exposes the Nekotakumi Labs defaults', () => {
		expect(siteName).toBe('Nekotakumi Labs');
		expect(defaultLocale).toBe('en_US');
		expect(defaultDescription).toContain('R&D lab');
	});
});

describe('canonicalUrl', () => {
	it('uses the current pathname by default and drops query/hash state', () => {
		expect(canonicalUrl(currentUrl)).toBe('https://example.test/blog/post');
	});

	it('normalizes the root path with a trailing slash', () => {
		expect(canonicalUrl(currentUrl, '/')).toBe('https://example.test/');
	});

	it('normalizes non-root paths without a trailing slash', () => {
		expect(canonicalUrl(currentUrl, '/blog/')).toBe('https://example.test/blog');
	});

	it('resolves relative paths against the current origin', () => {
		expect(canonicalUrl(currentUrl, 'about')).toBe('https://example.test/about');
	});
});

describe('absoluteUrl and ogImageUrl', () => {
	it('returns undefined when no optional path is provided', () => {
		expect(absoluteUrl(currentUrl)).toBeUndefined();
		expect(absoluteUrl(currentUrl, null)).toBeUndefined();
	});

	it('resolves relative and absolute paths', () => {
		expect(absoluteUrl(currentUrl, '/assets/cover.png')).toBe('https://example.test/assets/cover.png');
		expect(absoluteUrl(currentUrl, 'https://cdn.example.test/cover.png')).toBe('https://cdn.example.test/cover.png');
	});

	it('uses the default Open Graph image unless an explicit image is passed', () => {
		expect(ogImageUrl(currentUrl)).toBe('https://example.test/og-image.png');
		expect(ogImageUrl(currentUrl, '/custom.png')).toBe('https://example.test/custom.png');
	});
});

describe('jsonLd', () => {
	it('serializes objects as valid JSON', () => {
		const value = { '@type': 'WebSite', name: 'Nekotakumi Labs' };
		expect(JSON.parse(jsonLd(value))).toEqual(value);
	});

	it('escapes less-than characters to prevent script-tag termination', () => {
		expect(jsonLd({ value: '</script><script>alert(1)</script>' })).toBe(
			'{"value":"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"}'
		);
	});
});
