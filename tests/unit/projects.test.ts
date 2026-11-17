import { describe, expect, it } from 'vitest';
import { formatProjectDate, getProject, projects } from '../../src/lib/projects';

describe('lab projects', () => {
	it('keeps every project slug unique and every card link actionable', () => {
		const slugs = projects.map((project) => project.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
		expect(projects.every((project) => project.githubUrl.startsWith('https://github.com/'))).toBe(true);
	});

	it('provides a project for each detail route and returns undefined for unknown slugs', () => {
		expect(getProject('farmago')?.name).toBe('FarmaGO');
		expect(getProject('does-not-exist')).toBeUndefined();
	});
});

describe('formatProjectDate', () => {
	it('formats the date in English by default', () => {
		expect(formatProjectDate('2026-11-17')).toBe('Nov 17, 2026');
	});

	it('supports an alternate locale while keeping the UTC calendar day', () => {
		expect(formatProjectDate('2026-01-02', 'en-GB')).toBe('2 Jan 2026');
	});
});
