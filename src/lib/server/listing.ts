export const PAGE_SIZES = {
	blog: 8,
	techNews: 10,
	astronomyNews: 10,
	api: 20
} as const;

const MAX_PAGE_SIZE = 50;

export function parsePage(value: string | null, fallback = 1): number {
	const parsed = Number.parseInt(value ?? "", 10);
	if (!Number.isFinite(parsed) || parsed < 1) return fallback;
	return parsed;
}

export function parseLimit(value: string | null, fallback: number): number {
	const parsed = Number.parseInt(value ?? "", 10);
	if (!Number.isFinite(parsed) || parsed < 1) return fallback;
	return Math.min(parsed, MAX_PAGE_SIZE);
}

export function normalizeQuery(value: string | null, maxLength = 120): string {
	return (value ?? "").trim().slice(0, maxLength);
}

export function getOffset(page: number, limit: number): number {
	return (Math.max(1, page) - 1) * Math.max(1, limit);
}

export function getTotalPages(total: number, limit: number): number {
	if (total <= 0) return 0;
	return Math.ceil(total / Math.max(1, limit));
}
