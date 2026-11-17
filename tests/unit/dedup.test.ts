import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sqlMock } = vi.hoisted(() => ({ sqlMock: { unsafe: vi.fn() } }));

vi.mock('../../src/lib/server/expense-tracker/db', () => ({ default: sqlMock }));

import {
	getDailySummary,
	getDedupedDetail,
	getDedupedSummary,
	getMonthlySummary,
	getTopExpenses,
	getYearlySummary
} from '../../src/lib/server/expense-tracker/dedup';

beforeEach(() => sqlMock.unsafe.mockReset());

describe('getDedupedSummary', () => {
	it('combines normal sources with unmatched marketplace totals and converts numerics', async () => {
		sqlMock.unsafe
			.mockResolvedValueOnce([{ sumber: 'BCA', count: 3, total: '145.5' }])
			.mockResolvedValueOnce([{ count: 2, total: '30' }])
			.mockResolvedValueOnce([{ count: 0, total: '0' }]);

		await expect(getDedupedSummary('2026-03-01', '2026-03-31')).resolves.toEqual([
			{ sumber: 'BCA', count: 3, total: 145.5 },
			{ sumber: 'TOKOPEDIA', count: 2, total: 30 }
		]);

		expect(sqlMock.unsafe).toHaveBeenCalledTimes(3);
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain('t.sumber NOT IN ($3, $4)');
		expect(sqlMock.unsafe.mock.calls[0][1]).toEqual(['2026-03-01', '2026-03-31', 'TOKOPEDIA', 'GRAB']);
		expect(sqlMock.unsafe.mock.calls[1][1]).toEqual(['2026-03-01', '2026-03-31', 'TOKOPEDIA']);
		expect(sqlMock.unsafe.mock.calls[2][1]).toEqual(['2026-03-01', '2026-03-31', 'GRAB']);
		expect(sqlMock.unsafe.mock.calls[1][0]).toContain("j.sumber = 'JENIUS'");
	});

	it('uses the unbounded query path when dates are omitted', async () => {
		sqlMock.unsafe
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([]);

		await expect(getDedupedSummary()).resolves.toEqual([]);
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain("WHERE t.sumber NOT IN ('TOKOPEDIA', 'GRAB')");
		expect(sqlMock.unsafe.mock.calls[1][0]).toContain("WHERE t.sumber = 'TOKOPEDIA'");
		expect(sqlMock.unsafe.mock.calls[2][0]).toContain("WHERE t.sumber = 'GRAB'");
	});

	it('ignores a partial date range rather than binding only one endpoint', async () => {
		sqlMock.unsafe.mockResolvedValue([]);
		await getDedupedSummary('2026-03-01', undefined);
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain("WHERE t.sumber NOT IN ('TOKOPEDIA', 'GRAB')");
		expect(sqlMock.unsafe.mock.calls[0][1]).toEqual([]);
	});
});

describe('getDedupedDetail', () => {
	it('builds date/source filters, pagination bindings, and converts amounts', async () => {
		sqlMock.unsafe
			.mockResolvedValueOnce([{ total: 76 }])
			.mockResolvedValueOnce([{
				id: 18,
				tanggal: '2026-03-12',
				sumber: 'TOKOPEDIA',
				jenis: 'Online',
				deskripsi: 'Household items',
				jumlah: '96.25',
				via_jenius: true
			}]);

		await expect(getDedupedDetail('2026-03-01', '2026-03-31', 'TOKOPEDIA', 3, 25)).resolves.toEqual({
			rows: [{
				id: 18,
				tanggal: '2026-03-12',
				sumber: 'TOKOPEDIA',
				jenis: 'Online',
				deskripsi: 'Household items',
				jumlah: 96.25,
				via_jenius: true
			}],
			total: 76
		});

		expect(sqlMock.unsafe).toHaveBeenCalledTimes(2);
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain('t.tanggal >= $1 AND t.tanggal <= $2 AND t.sumber = $3');
		expect(sqlMock.unsafe.mock.calls[0][1]).toEqual(['2026-03-01', '2026-03-31', 'TOKOPEDIA']);
		expect(sqlMock.unsafe.mock.calls[1][0]).toContain('LIMIT $4 OFFSET $5');
		expect(sqlMock.unsafe.mock.calls[1][1]).toEqual(['2026-03-01', '2026-03-31', 'TOKOPEDIA', 25, 50]);
	});

	it('supports date-only filters', async () => {
		sqlMock.unsafe.mockResolvedValueOnce([{ total: 0 }]).mockResolvedValueOnce([]);
		await expect(getDedupedDetail('2026-03-01', '2026-03-31')).resolves.toEqual({ rows: [], total: 0 });
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain('WHERE t.tanggal >= $1 AND t.tanggal <= $2');
		expect(sqlMock.unsafe.mock.calls[1][1]).toEqual(['2026-03-01', '2026-03-31', 50, 0]);
	});

	it('supports source-only filters and an empty count response', async () => {
		sqlMock.unsafe.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
		await expect(getDedupedDetail(undefined, undefined, 'BCA')).resolves.toEqual({ rows: [], total: 0 });
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain('WHERE t.sumber = $1');
		expect(sqlMock.unsafe.mock.calls[1][1]).toEqual(['BCA', 50, 0]);
	});

	it('supports an unfiltered first page', async () => {
		sqlMock.unsafe.mockResolvedValueOnce([{ total: 1 }]).mockResolvedValueOnce([]);
		await getDedupedDetail();
		expect(sqlMock.unsafe.mock.calls[0][0]).not.toContain('WHERE');
		expect(sqlMock.unsafe.mock.calls[1][0]).toContain('LIMIT $1 OFFSET $2');
		expect(sqlMock.unsafe.mock.calls[1][1]).toEqual([50, 0]);
	});
});

describe('getTopExpenses', () => {
	it('applies a date range and converts database amounts', async () => {
		sqlMock.unsafe.mockResolvedValue([{ deskripsi: 'Rent', jumlah: '2500', sumber: 'BCA' }]);
		await expect(getTopExpenses('2026-03-01', '2026-03-31', 5)).resolves.toEqual([
			{ deskripsi: 'Rent', jumlah: 2500, sumber: 'BCA' }
		]);
		expect(sqlMock.unsafe.mock.calls[0][1]).toEqual(['2026-03-01', '2026-03-31', 5]);
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain('LIMIT $3');
	});

	it('uses a default limit without date filters', async () => {
		sqlMock.unsafe.mockResolvedValue([]);
		await expect(getTopExpenses()).resolves.toEqual([]);
		expect(sqlMock.unsafe.mock.calls[0][1]).toEqual([10]);
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain('LIMIT $1');
	});
});

describe('grouped summary queries', () => {
	it('aggregates daily rows by date and excludes duplicated marketplace sources', async () => {
		sqlMock.unsafe.mockResolvedValue([
			{ date: '2026-03-01', sumber: 'BCA', count: 2, total: '15' },
			{ date: '2026-03-01', sumber: 'JENIUS', count: 1, total: '20.5' },
			{ date: '2026-03-02', sumber: 'BCA', count: 1, total: '30' }
		]);
		await expect(getDailySummary('2026-03-01', '2026-03-31')).resolves.toEqual([
			{
				date: '2026-03-01',
				total: 35.5,
				sources: [
					{ sumber: 'BCA', count: 2, total: 15 },
					{ sumber: 'JENIUS', count: 1, total: 20.5 }
				]
			},
			{ date: '2026-03-02', total: 30, sources: [{ sumber: 'BCA', count: 1, total: 30 }] }
		]);
		expect(sqlMock.unsafe.mock.calls[0][1]).toEqual(['2026-03-01', '2026-03-31']);
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain("t.sumber NOT IN ('TOKOPEDIA', 'GRAB')");
	});

	it('supports daily summaries without optional dates', async () => {
		sqlMock.unsafe.mockResolvedValue([]);
		await expect(getDailySummary()).resolves.toEqual([]);
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain("WHERE t.sumber NOT IN ('TOKOPEDIA', 'GRAB')");
	});

	it('aggregates monthly rows and creates a WHERE clause without dates', async () => {
		sqlMock.unsafe.mockResolvedValue([
			{ month: '2026-03', sumber: 'BCA', count: 3, total: '70' },
			{ month: '2026-03', sumber: 'JENIUS', count: 1, total: '30' },
			{ month: '2026-04', sumber: 'BCA', count: 1, total: '10' }
		]);
		await expect(getMonthlySummary()).resolves.toEqual([
			{ month: '2026-03', total: 100, sources: [{ sumber: 'BCA', count: 3, total: 70 }, { sumber: 'JENIUS', count: 1, total: 30 }] },
			{ month: '2026-04', total: 10, sources: [{ sumber: 'BCA', count: 1, total: 10 }] }
		]);
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain("WHERE t.sumber NOT IN ('TOKOPEDIA', 'GRAB')");
	});

	it('applies month range conditions when dates are present', async () => {
		sqlMock.unsafe.mockResolvedValue([]);
		await getMonthlySummary('2026-03-01', '2026-03-31');
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain('WHERE t.tanggal >= $1 AND t.tanggal <= $2');
		expect(sqlMock.unsafe.mock.calls[0][1]).toEqual(['2026-03-01', '2026-03-31']);
	});

	it('aggregates yearly rows and creates a WHERE clause without dates', async () => {
		sqlMock.unsafe.mockResolvedValue([
			{ year: '2025', sumber: 'BCA', count: 5, total: '100' },
			{ year: '2025', sumber: 'JENIUS', count: 2, total: '40' }
		]);
		await expect(getYearlySummary()).resolves.toEqual([
			{ year: '2025', total: 140, sources: [{ sumber: 'BCA', count: 5, total: 100 }, { sumber: 'JENIUS', count: 2, total: 40 }] }
		]);
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain("WHERE t.sumber NOT IN ('TOKOPEDIA', 'GRAB')");
	});

	it('applies year range conditions when dates are present', async () => {
		sqlMock.unsafe.mockResolvedValue([]);
		await getYearlySummary('2025-01-01', '2025-12-31');
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain('WHERE t.tanggal >= $1 AND t.tanggal <= $2');
		expect(sqlMock.unsafe.mock.calls[0][1]).toEqual(['2025-01-01', '2025-12-31']);
	});
});
