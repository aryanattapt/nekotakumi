import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	getDedupedSummary: vi.fn(),
	getDedupedDetail: vi.fn(),
	getTopExpenses: vi.fn(),
	getDailySummary: vi.fn(),
	getMonthlySummary: vi.fn(),
	getYearlySummary: vi.fn()
}));

vi.mock('../../src/lib/server/expense-tracker/dedup', () => ({
	getDedupedSummary: mocks.getDedupedSummary,
	getDedupedDetail: mocks.getDedupedDetail,
	getTopExpenses: mocks.getTopExpenses,
	getDailySummary: mocks.getDailySummary,
	getMonthlySummary: mocks.getMonthlySummary,
	getYearlySummary: mocks.getYearlySummary
}));

import { getDetail, getSummary, getTopExpensesData } from '../../src/lib/server/expense-tracker/queries';

describe('getSummary', () => {
	const period = { start: '2026-01-01', end: '2026-01-31' };

	beforeEach(() => {
		mocks.getDedupedSummary.mockResolvedValue([]);
		mocks.getDailySummary.mockResolvedValue([]);
		mocks.getMonthlySummary.mockResolvedValue([]);
		mocks.getYearlySummary.mockResolvedValue([]);
	});

	it('returns the default source summary and sums its grand total', async () => {
		mocks.getDedupedSummary.mockResolvedValue([
			{ sumber: 'BCA', count: 2, total: 120 },
			{ sumber: 'JENIUS', count: 1, total: 80 }
		]);

		await expect(getSummary(period.start, period.end)).resolves.toEqual({
			sources: [
				{ sumber: 'BCA', count: 2, total: 120 },
				{ sumber: 'JENIUS', count: 1, total: 80 }
			],
			grand_total: 200,
			period
		});
		 expect(mocks.getDedupedSummary).toHaveBeenCalledWith(period.start, period.end);
	});

	it('supports explicit daily grouping', async () => {
		mocks.getDailySummary.mockResolvedValue([
			{ date: '2026-01-01', total: 30, sources: [] },
			{ date: '2026-01-02', total: 70, sources: [] }
		]);

		await expect(getSummary(period.start, period.end, 'daily')).resolves.toEqual({
			daily: [
				{ date: '2026-01-01', total: 30, sources: [] },
				{ date: '2026-01-02', total: 70, sources: [] }
			],
			grand_total: 100,
			period
		});
		 expect(mocks.getDailySummary).toHaveBeenCalledWith(period.start, period.end);
	});

	it('supports explicit monthly grouping', async () => {
		mocks.getMonthlySummary.mockResolvedValue([{ month: '2026-01', total: 500, sources: [] }]);
		await expect(getSummary(period.start, period.end, 'monthly')).resolves.toMatchObject({
			monthly: [{ month: '2026-01', total: 500, sources: [] }],
			grand_total: 500,
			period
		});
	});

	it('supports explicit yearly grouping', async () => {
		mocks.getYearlySummary.mockResolvedValue([{ year: '2026', total: 900, sources: [] }]);
		await expect(getSummary(period.start, period.end, 'yearly')).resolves.toMatchObject({
			yearly: [{ year: '2026', total: 900, sources: [] }],
			grand_total: 900,
			period
		});
	});

	it('returns zero for an empty grouped result', async () => {
		await expect(getSummary(period.start, period.end, 'daily')).resolves.toMatchObject({ grand_total: 0 });
	});

	it('propagates a repository failure', async () => {
		mocks.getDedupedSummary.mockRejectedValue(new Error('database unavailable'));
		await expect(getSummary(period.start, period.end)).rejects.toThrow('database unavailable');
	});
});

describe('getDetail', () => {
	it('maps database rows to the API response and preserves pagination', async () => {
		const rows = [{
			id: 4,
			tanggal: '2026-01-10',
			sumber: 'BCA',
			jenis: null,
			deskripsi: 'Groceries',
			jumlah: 125,
			via_jenius: false
		}];
		mocks.getDedupedDetail.mockResolvedValue({ rows, total: 101 });

		await expect(getDetail('2026-01-01', '2026-01-31', 'BCA', 3, 25)).resolves.toEqual({
			transactions: rows,
			total: 101,
			page: 3,
			limit: 25
		});
		 expect(mocks.getDedupedDetail).toHaveBeenCalledWith('2026-01-01', '2026-01-31', 'BCA', 3, 25);
	});

	it('uses the default page and limit when omitted', async () => {
		mocks.getDedupedDetail.mockResolvedValue({ rows: [], total: 0 });
		await expect(getDetail('2026-01-01', '2026-01-31')).resolves.toMatchObject({ page: 1, limit: 50 });
	});
});

describe('getTopExpensesData', () => {
	it('wraps rows and the date range in the API shape', async () => {
		const topExpenses = [{ deskripsi: 'Rent', jumlah: 2500, sumber: 'BCA' }];
		mocks.getTopExpenses.mockResolvedValue(topExpenses);

		await expect(getTopExpensesData('2026-01-01', '2026-01-31', 5)).resolves.toEqual({
			top_expenses: topExpenses,
			period: { start: '2026-01-01', end: '2026-01-31' }
		});
		 expect(mocks.getTopExpenses).toHaveBeenCalledWith('2026-01-01', '2026-01-31', 5);
	});

	it('defaults the result limit to ten', async () => {
		mocks.getTopExpenses.mockResolvedValue([]);
		await getTopExpensesData('2026-01-01', '2026-01-31');
		expect(mocks.getTopExpenses).toHaveBeenCalledWith('2026-01-01', '2026-01-31', 10);
	});
});
