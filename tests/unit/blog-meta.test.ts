import { describe, expect, it } from 'vitest';
import { detectLanguage, estimateReadingMinutes } from '../../src/lib/blog-meta';

describe('estimateReadingMinutes', () => {
	it.each([
		['empty content', '', 1],
		['a short note', 'A small note from the lab.', 1],
		['exactly two hundred words', Array(200).fill('word').join(' '), 1],
		['just over two hundred words', Array(201).fill('word').join(' '), 2],
		['null content', null, 1]
	])('estimates %s as %i minute(s)', (_label, content, minutes) => {
		expect(estimateReadingMinutes(content)).toBe(minutes);
	});

	it('ignores code blocks and HTML tags when counting words', () => {
		const content = '<p>One thoughtful note.</p>\n```\n' + Array(300).fill('token').join(' ') + '\n```';
		expect(estimateReadingMinutes(content)).toBe(1);
	});

	it('counts non-Latin writing as words', () => {
		expect(estimateReadingMinutes('研究メモと学び')).toBe(1);
	});
});

describe('detectLanguage', () => {
	it('labels Indonesian text ID when it has more Indonesian markers', () => {
		expect(detectLanguage('Saya ingin memahami yang terjadi dengan sistem ini.')).toBe('ID');
	});

	it('labels English text EN when it has more English markers', () => {
		expect(detectLanguage('The notes are for the next experiment with a clearer question.')).toBe('EN');
	});

	it('defaults to EN for short or ambiguous text', () => {
		expect(detectLanguage('A useful note')).toBe('EN');
		expect(detectLanguage('')).toBe('EN');
		expect(detectLanguage(null)).toBe('EN');
	});
});
