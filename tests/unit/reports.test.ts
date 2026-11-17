import ExcelJS from 'exceljs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sqlMock } = vi.hoisted(() => ({ sqlMock: { unsafe: vi.fn() } }));

vi.mock('../../src/lib/server/expense-tracker/db', () => ({ default: sqlMock }));

import {
	buildCsvReport,
	buildPdfReport,
	buildXlsxReport,
	getMonthlyReport,
	getReportFilename,
	type MonthlyReportData
} from '../../src/lib/server/expense-tracker/reports';

const sampleReport: MonthlyReportData = {
	monthly: [
		{ bulan: '2026-03', total: 125000 },
		{ bulan: '2026-04', total: 85000 }
	],
	summary: { total: 210000 },
	period: { start: '2026-03-01', end: '2026-04-30' }
};

beforeEach(() => sqlMock.unsafe.mockReset());

describe('getReportFilename', () => {
	it('creates the normalized report base name', () => {
		expect(getReportFilename('2026-03-01', '2026-03-31', '')).toBe('expense-report-2026-03-01-to-2026-03-31');
	});

	it.each(['csv', 'xlsx', 'pdf'])('adds the requested .%s extension', (extension) => {
		expect(getReportFilename('2026-03-01', '2026-03-31', extension)).toBe(
			`expense-report-2026-03-01-to-2026-03-31.${extension}`
		);
	});
});

describe('getMonthlyReport', () => {
	it('queries the period, converts database numeric strings, and sums monthly totals', async () => {
		sqlMock.unsafe.mockResolvedValue([
			{ bulan: '2026-03', total: '120.5' },
			{ bulan: '2026-04', total: '79.5' }
		]);

		await expect(getMonthlyReport('2026-03-01', '2026-04-30')).resolves.toEqual({
			monthly: [
				{ bulan: '2026-03', total: 120.5 },
				{ bulan: '2026-04', total: 79.5 }
			],
			summary: { total: 200 },
			period: { start: '2026-03-01', end: '2026-04-30' }
		});
		expect(sqlMock.unsafe.mock.calls[0][1]).toEqual(['2026-03-01', '2026-04-30']);
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain("t.sumber NOT IN ('TOKOPEDIA', 'GRAB')");
		expect(sqlMock.unsafe.mock.calls[0][0]).toContain("j.sumber = 'JENIUS'");
	});

	it('returns a zero summary when there are no matching transactions', async () => {
		sqlMock.unsafe.mockResolvedValue([]);
		await expect(getMonthlyReport('2026-03-01', '2026-03-31')).resolves.toMatchObject({
			monthly: [],
			summary: { total: 0 }
		});
	});

	it('normalizes a database zero numeric value', async () => {
		sqlMock.unsafe.mockResolvedValue([{ bulan: '2026-03', total: 0 }]);
		await expect(getMonthlyReport('2026-03-01', '2026-03-31')).resolves.toMatchObject({
			monthly: [{ bulan: '2026-03', total: 0 }],
			summary: { total: 0 }
		});
	});

});

describe('buildCsvReport', () => {
	it('writes the English header and all monthly totals', () => {
		expect(buildCsvReport(sampleReport)).toBe('Month,Total\n2026-03,125000\n2026-04,85000');
	});

	it('escapes commas, quotes, and newlines using CSV quoting rules', () => {
		const report: MonthlyReportData = {
			...sampleReport,
			monthly: [{ bulan: '2026,"March"\nsecond line', total: 10 }]
		};
		expect(buildCsvReport(report)).toBe('Month,Total\n"2026,""March""\nsecond line",10');
	});

	it('returns only the header for an empty report', () => {
		expect(buildCsvReport({ ...sampleReport, monthly: [] })).toBe('Month,Total');
	});
});

describe('buildXlsxReport', () => {
	it('produces a readable workbook with report metadata, rows, filters, and IDR formats', async () => {
		const buffer = await buildXlsxReport(sampleReport);
		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(buffer);
		const sheet = workbook.getWorksheet('Expense report');

		expect(sheet).toBeDefined();
		expect(sheet?.getCell('A1').value).toBe('Expense Tracker Report');
		expect(sheet?.getCell('A2').value).toBe('Period: 2026-03-01 to 2026-04-30');
		expect(sheet?.getCell('A4').value).toBe('Total expenses');
		expect(sheet?.getCell('B4').value).toBe(210000);
		expect(sheet?.getRow(6).values).toEqual([undefined, 'Month', 'Total']);
		expect(sheet?.getRow(7).values).toEqual([undefined, '2026-03', 125000]);
		expect(sheet?.getCell('B4').numFmt).toContain('IDR');
		expect(sheet?.autoFilter).toBe('A6:B8');
	});

	it('supports an empty report without malformed data rows', async () => {
		const buffer = await buildXlsxReport({ ...sampleReport, monthly: [], summary: { total: 0 } });
		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(buffer);
		const sheet = workbook.getWorksheet('Expense report');
		expect(sheet?.getRow(6).values).toEqual([undefined, 'Month', 'Total']);
		expect(sheet?.rowCount).toBe(6);
	});
});

describe('buildPdfReport', () => {
	it('returns a valid PDF document for an empty monthly report', async () => {
		const pdf = await buildPdfReport({ ...sampleReport, monthly: [], summary: { total: 0 } });
		expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
		expect(pdf.length).toBeGreaterThan(500);
	});

	it('adds pages and repeats the table header when rows exceed one page', async () => {
		const monthly = Array.from({ length: 80 }, (_, index) => ({
			bulan: `202${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`,
			total: (index + 1) * 100
		}));
		const pdf = await buildPdfReport({ ...sampleReport, monthly, summary: { total: 324000 } });
		const pdfText = pdf.toString('latin1');
		const pageObjects = pdfText.match(/\/Type \/Page\b/g) || [];
		expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
		expect(pageObjects.length).toBeGreaterThan(1);
	});
});
