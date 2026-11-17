import { describe, expect, it } from 'vitest';
import {
	PAGE_SIZES,
	getOffset,
	getCurrentMonthDateRange,
	getTotalPages,
	normalizeQuery,
	parseLimit,
	parsePage
} from '../../src/lib/server/listing';

describe('listing constants', () => {
	it('uses the expected page sizes for public lists and APIs', () => {
		expect(PAGE_SIZES).toEqual({ blog: 8, techNews: 10, astronomyNews: 10, api: 20 });
	});
});

describe('parsePage', () => {
	it.each([
		['null', null, 1, 1],
		['empty', '', 1, 1],
		['zero', '0', 1, 1],
		['negative', '-3', 1, 1],
		['invalid', 'abc', 1, 1],
		['custom fallback', 'abc', 7, 7],
		['positive value', '12', 1, 12],
		['integer prefix', '12tail', 1, 12],
		['decimal prefix', '2.8', 1, 2]
	])('parses %s input safely', (_case, input, fallback, expected) => {
		expect(parsePage(input, fallback)).toBe(expected);
	});
});

describe('parseLimit', () => {
	it.each([
		['missing', null, 20, 20],
		['empty', '', 8, 8],
		['zero', '0', 20, 20],
		['negative', '-5', 20, 20],
		['invalid', 'many', 15, 15],
		['positive', '25', 20, 25],
		['maximum allowed', '50', 20, 50],
		['over the cap', '500', 20, 50],
		['integer prefix', '9items', 20, 9]
	])('parses %s input and applies the limit cap', (_case, input, fallback, expected) => {
		expect(parseLimit(input, fallback)).toBe(expected);
	});
});

describe('normalizeQuery', () => {
	it('turns a missing query into an empty string', () => {
		expect(normalizeQuery(null)).toBe('');
	});

	it('trims leading and trailing whitespace', () => {
		expect(normalizeQuery('  search terms  ')).toBe('search terms');
	});

	it('truncates long queries to the default maximum length', () => {
		expect(normalizeQuery('x'.repeat(130))).toHaveLength(120);
	});

	it('supports a custom maximum length', () => {
		expect(normalizeQuery('abcdefgh', 4)).toBe('abcd');
	});
});

describe('pagination calculations', () => {
	it.each([
		[1, 20, 0],
		[2, 20, 20],
		[4, 8, 24],
		[0, 20, 0]
	])('calculates offset for page %i and limit %i', (page, limit, expected) => {
		expect(getOffset(page, limit)).toBe(expected);
	});

	it.each([
		[0, 20, 0],
		[-10, 20, 0],
		[1, 20, 1],
		[20, 20, 1],
		[21, 20, 2],
		[41, 20, 3],
		[10, 0, 10]
	])('calculates page count for %i records at limit %i', (total, limit, expected) => {
		expect(getTotalPages(total, limit)).toBe(expected);
	});
});

describe('current month date range', () => {
	it.each([
		[new Date(2026, 2, 15, 12), { start: '2026-03-01', end: '2026-03-15' }],
		[new Date(2024, 1, 29, 12), { start: '2024-02-01', end: '2024-02-29' }],
		[new Date(2026, 0, 1, 12), { start: '2026-01-01', end: '2026-01-01' }]
	])('formats date-only values for %s', (today, expected) => {
		expect(getCurrentMonthDateRange(today)).toEqual(expected);
	});
});
