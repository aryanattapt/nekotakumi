import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	const sql = Object.assign(vi.fn(), { unsafe: vi.fn() });
	return {
		sql,
		verifyAuth: vi.fn(),
		verifyPassword: vi.fn(),
		generateToken: vi.fn(),
		getSummary: vi.fn(),
		getDetail: vi.fn(),
		getTopExpensesData: vi.fn(),
		buildCsvReport: vi.fn(),
		buildPdfReport: vi.fn(),
		buildXlsxReport: vi.fn(),
		getMonthlyReport: vi.fn(),
		getReportFilename: vi.fn()
	};
});

vi.mock('$lib/server/expense-tracker/auth', () => ({
	verifyAuth: mocks.verifyAuth,
	verifyPassword: mocks.verifyPassword,
	generateToken: mocks.generateToken
}));
vi.mock('$lib/server/expense-tracker/db', () => ({ default: mocks.sql }));
vi.mock('$lib/server/expense-tracker/queries', () => ({
	getSummary: mocks.getSummary,
	getDetail: mocks.getDetail,
	getTopExpensesData: mocks.getTopExpensesData
}));
vi.mock('$lib/server/expense-tracker/reports', () => ({
	buildCsvReport: mocks.buildCsvReport,
	buildPdfReport: mocks.buildPdfReport,
	buildXlsxReport: mocks.buildXlsxReport,
	getMonthlyReport: mocks.getMonthlyReport,
	getReportFilename: mocks.getReportFilename
}));

import * as authRoute from '../../src/routes/api/expense-tracker/auth/+server';
import * as settingsRoute from '../../src/routes/api/expense-tracker/settings/+server';
import * as categoriesRoute from '../../src/routes/api/expense-tracker/categories/+server';
import * as budgetsRoute from '../../src/routes/api/expense-tracker/budgets/+server';
import * as summaryRoute from '../../src/routes/api/expense-tracker/summary/+server';
import * as detailRoute from '../../src/routes/api/expense-tracker/detail/+server';
import * as topExpensesRoute from '../../src/routes/api/expense-tracker/top-expenses/+server';
import * as reportsRoute from '../../src/routes/api/expense-tracker/reports/+server';

function makeRequest(
	url: string,
	options: { method?: string; body?: unknown; authorized?: boolean } = {}
) {
	const headers = new Headers();
	if (options.authorized !== false) headers.set('authorization', 'Bearer test-token');
	return new Request(url, {
		method: options.method || 'GET',
		headers,
		body: options.body === undefined ? undefined : JSON.stringify(options.body)
	});
}

function event(url: string, options: Parameters<typeof makeRequest>[1] = {}) {
	const request = makeRequest(url, options);
	return { request, url: new URL(url) };
}

async function responseJson(response: Response) {
	return response.json();
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.verifyAuth.mockReturnValue(true);
	mocks.verifyPassword.mockResolvedValue(true);
	mocks.generateToken.mockReturnValue('generated-test-token');
	mocks.sql.mockResolvedValue([]);
	mocks.sql.unsafe.mockResolvedValue([]);
	mocks.getSummary.mockResolvedValue({ sources: [], grand_total: 0 });
	mocks.getDetail.mockResolvedValue({ transactions: [], total: 0, page: 1, limit: 50 });
	mocks.getTopExpensesData.mockResolvedValue({ top_expenses: [], period: {} });
	mocks.getMonthlyReport.mockResolvedValue({ monthly: [], summary: { total: 0 }, period: {} });
	mocks.getReportFilename.mockImplementation((start, end, extension) => {
		const base = `expense-report-${start}-to-${end}`;
		return extension ? `${base}.${extension}` : base;
	});
	mocks.buildCsvReport.mockReturnValue('Month,Total');
	mocks.buildXlsxReport.mockResolvedValue(Buffer.from('xlsx-content'));
	mocks.buildPdfReport.mockResolvedValue(Buffer.from('%PDF-test'));
});

afterEach(() => vi.useRealTimers());

describe('auth API', () => {
	it('rejects malformed JSON without calling password verification', async () => {
		const request = new Request('https://example.test/api/expense-tracker/auth', {
			method: 'POST',
			body: '{not json'
		});
		const response = await authRoute.POST({ request });

		expect(response.status).toBe(400);
		expect(await responseJson(response)).toEqual({ ok: false, error: 'Invalid request' });
		expect(mocks.verifyPassword).not.toHaveBeenCalled();
	});

	it('requires a password', async () => {
		const response = await authRoute.POST({
			request: makeRequest('https://example.test/api/expense-tracker/auth', { method: 'POST', body: {} })
		});
		expect(response.status).toBe(400);
		expect(await responseJson(response)).toEqual({ ok: false, error: 'Password required' });
		expect(mocks.verifyPassword).not.toHaveBeenCalled();
	});

	it('returns unauthorized for an incorrect password', async () => {
		mocks.verifyPassword.mockResolvedValue(false);
		const response = await authRoute.POST({
			request: makeRequest('https://example.test/api/expense-tracker/auth', {
				method: 'POST', body: { password: 'wrong' }
			})
		});
		expect(response.status).toBe(401);
		expect(await responseJson(response)).toEqual({ ok: false, error: 'Wrong password' });
		expect(mocks.generateToken).not.toHaveBeenCalled();
	});

	it('returns a token after successful password verification', async () => {
		const response = await authRoute.POST({
			request: makeRequest('https://example.test/api/expense-tracker/auth', {
				method: 'POST', body: { password: 'correct' }
			})
		});
		expect(response.status).toBe(200);
		expect(await responseJson(response)).toEqual({ ok: true, token: 'generated-test-token' });
		expect(mocks.verifyPassword).toHaveBeenCalledWith('correct');
		expect(mocks.generateToken).toHaveBeenCalledOnce();
	});

	it('checks an authenticated session', async () => {
		const response = await authRoute.GET({ request: makeRequest('https://example.test/api/expense-tracker/auth') });
		expect(response.status).toBe(200);
		expect(await responseJson(response)).toEqual({ ok: true });
	});

	it('rejects an unauthenticated session check', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const response = await authRoute.GET({
			request: makeRequest('https://example.test/api/expense-tracker/auth', { authorized: false })
		});
		expect(response.status).toBe(401);
		expect(await responseJson(response)).toEqual({ ok: false, error: 'Unauthorized' });
	});
});

describe('settings API', () => {
	it('blocks unauthenticated status checks before querying the database', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const response = await settingsRoute.GET({ request: makeRequest('https://example.test/api/settings', { authorized: false }) });
		expect(response.status).toBe(401);
		expect(mocks.sql).not.toHaveBeenCalled();
	});

	it('reports a connected database', async () => {
		const response = await settingsRoute.GET({ request: makeRequest('https://example.test/api/settings') });
		expect(response.status).toBe(200);
		expect(await responseJson(response)).toEqual({ db_status: 'connected' });
		expect(mocks.sql).toHaveBeenCalledOnce();
	});

	it('reports database errors as a disconnected state', async () => {
		mocks.sql.mockImplementation(() => { throw new Error('connection refused'); });
		const response = await settingsRoute.GET({ request: makeRequest('https://example.test/api/settings') });
		expect(response.status).toBe(200);
		expect(await responseJson(response)).toEqual({ db_status: 'disconnected', error: 'Error: connection refused' });
	});

	it('keeps password updates explicitly unavailable', async () => {
		const response = await settingsRoute.POST({ request: makeRequest('https://example.test/api/settings', { method: 'POST' }) });
		expect(response.status).toBe(501);
		expect(await responseJson(response)).toMatchObject({ error: expect.stringContaining('unavailable') });
		expect(mocks.sql).not.toHaveBeenCalled();
	});

	it('rejects unauthenticated password update requests', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const response = await settingsRoute.POST({
			request: makeRequest('https://example.test/api/settings', { method: 'POST', authorized: false })
		});
		expect(response.status).toBe(401);
		expect(mocks.sql).not.toHaveBeenCalled();
	});
});

describe('categories API', () => {
	it('requires authentication for list requests', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const response = await categoriesRoute.GET({ request: makeRequest('https://example.test/api/categories', { authorized: false }) });
		expect(response.status).toBe(401);
		expect(mocks.sql).not.toHaveBeenCalled();
	});

	it('requires authentication before every category mutation', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const operations = [
			categoriesRoute.POST({ request: makeRequest('https://example.test/api/categories', { method: 'POST', body: {}, authorized: false }) }),
			categoriesRoute.PUT({ request: makeRequest('https://example.test/api/categories', { method: 'PUT', body: { id: 1 }, authorized: false }) }),
			categoriesRoute.DELETE({ request: makeRequest('https://example.test/api/categories', { method: 'DELETE', body: { id: 1 }, authorized: false }) })
		];
		const responses = await Promise.all(operations);
		expect(responses.map((response) => response.status)).toEqual([401, 401, 401]);
		expect(mocks.sql).not.toHaveBeenCalled();
	});

	it('lists rows returned by the database', async () => {
		const categories = [{ id: 3, nama: 'Groceries', tipe: 'pengeluaran' }];
		mocks.sql.mockResolvedValue(categories);
		const response = await categoriesRoute.GET({ request: makeRequest('https://example.test/api/categories') });
		expect(await responseJson(response)).toEqual({ categories });
	});

	it('returns a server error when listing fails', async () => {
		mocks.sql.mockImplementation(() => { throw new Error('database down'); });
		const response = await categoriesRoute.GET({ request: makeRequest('https://example.test/api/categories') });
		expect(response.status).toBe(500);
		expect(await responseJson(response)).toEqual({ error: 'Error: database down' });
	});

	it('requires category name and type', async () => {
		const response = await categoriesRoute.POST({
			request: makeRequest('https://example.test/api/categories', { method: 'POST', body: { nama: 'Food' } })
		});
		expect(response.status).toBe(400);
		expect(await responseJson(response)).toEqual({ error: 'Category name and type are required.' });
		expect(mocks.sql).not.toHaveBeenCalled();
	});

	it.each(['income', 'transfer'] as const)('rejects unsupported category type: %s', async (tipe) => {
		const response = await categoriesRoute.POST({
			request: makeRequest('https://example.test/api/categories', { method: 'POST', body: { nama: 'Test', tipe } })
		});
		expect(response.status).toBe(400);
		expect(await responseJson(response)).toEqual({ error: 'Type must be income or expense.' });
	});

	it('creates a valid category and uses null for an omitted icon', async () => {
		const category = { id: 7, nama: 'Salary', tipe: 'pemasukan', icon: null };
		mocks.sql.mockResolvedValue([category]);
		const response = await categoriesRoute.POST({
			request: makeRequest('https://example.test/api/categories', {
				method: 'POST', body: { nama: 'Salary', tipe: 'pemasukan' }
			})
		});
		expect(response.status).toBe(201);
		expect(await responseJson(response)).toEqual({ ok: true, category });
		expect(mocks.sql.mock.calls[0].slice(1)).toEqual(['Salary', 'pemasukan', null]);
	});

	it('returns a server error when category creation fails', async () => {
		mocks.sql.mockImplementation(() => { throw new Error('insert failed'); });
		const response = await categoriesRoute.POST({
			request: makeRequest('https://example.test/api/categories', {
				method: 'POST', body: { nama: 'Salary', tipe: 'pemasukan' }
			})
		});
		expect(response.status).toBe(500);
		expect(await responseJson(response)).toEqual({ error: 'Error: insert failed' });
	});

	it('requires an id before updating', async () => {
		const response = await categoriesRoute.PUT({
			request: makeRequest('https://example.test/api/categories', { method: 'PUT', body: { nama: 'New name' } })
		});
		expect(response.status).toBe(400);
		expect(await responseJson(response)).toEqual({ error: 'id required' });
		expect(mocks.sql).not.toHaveBeenCalled();
	});

	it('returns not found for an unknown category update', async () => {
		mocks.sql.mockResolvedValue([]);
		const response = await categoriesRoute.PUT({
			request: makeRequest('https://example.test/api/categories', { method: 'PUT', body: { id: 99, nama: 'Unknown' } })
		});
		expect(response.status).toBe(404);
		expect(await responseJson(response)).toEqual({ error: 'Not found' });
	});

	it('returns the updated category', async () => {
		const category = { id: 7, nama: 'Salary 2', tipe: 'pemasukan', icon: 'wallet' };
		mocks.sql.mockResolvedValue([category]);
		const response = await categoriesRoute.PUT({
			request: makeRequest('https://example.test/api/categories', {
				method: 'PUT', body: { id: 7, nama: 'Salary 2', icon: 'wallet' }
			})
		});
		expect(response.status).toBe(200);
		expect(await responseJson(response)).toEqual({ ok: true, category });
	});

	it('returns a server error when updating a category fails', async () => {
		mocks.sql.mockImplementation(() => { throw new Error('update failed'); });
		const response = await categoriesRoute.PUT({
			request: makeRequest('https://example.test/api/categories', { method: 'PUT', body: { id: 7, nama: 'Salary' } })
		});
		expect(response.status).toBe(500);
		expect(await responseJson(response)).toEqual({ error: 'Error: update failed' });
	});

	it('requires an id before deleting', async () => {
		const response = await categoriesRoute.DELETE({
			request: makeRequest('https://example.test/api/categories', { method: 'DELETE', body: {} })
		});
		expect(response.status).toBe(400);
		expect(mocks.sql).not.toHaveBeenCalled();
	});

	it('returns not found when deleting a missing category', async () => {
		mocks.sql.mockResolvedValue([]);
		const response = await categoriesRoute.DELETE({
			request: makeRequest('https://example.test/api/categories', { method: 'DELETE', body: { id: 404 } })
		});
		expect(response.status).toBe(404);
	});

	it('deletes an existing category', async () => {
		mocks.sql.mockResolvedValue([{ id: 7 }]);
		const response = await categoriesRoute.DELETE({
			request: makeRequest('https://example.test/api/categories', { method: 'DELETE', body: { id: 7 } })
		});
		expect(response.status).toBe(200);
		expect(await responseJson(response)).toEqual({ ok: true });
	});

	it('returns a server error when deleting a category fails', async () => {
		mocks.sql.mockImplementation(() => { throw new Error('delete failed'); });
		const response = await categoriesRoute.DELETE({
			request: makeRequest('https://example.test/api/categories', { method: 'DELETE', body: { id: 7 } })
		});
		expect(response.status).toBe(500);
		expect(await responseJson(response)).toEqual({ error: 'Error: delete failed' });
	});
});

describe('budgets API', () => {
	it('lists the budget query result after authentication', async () => {
		const budgets = [{ id: 2, kategori_id: 4, jumlah: 250000, periode: 'bulanan' }];
		mocks.sql.mockResolvedValue(budgets);
		const response = await budgetsRoute.GET({ request: makeRequest('https://example.test/api/budgets') });
		expect(await responseJson(response)).toEqual({ budgets });
	});

	it('rejects unauthenticated budget access', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const response = await budgetsRoute.GET({ request: makeRequest('https://example.test/api/budgets', { authorized: false }) });
		expect(response.status).toBe(401);
		expect(mocks.sql).not.toHaveBeenCalled();
	});

	it('requires authentication before every budget mutation', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const operations = [
			budgetsRoute.POST({ request: makeRequest('https://example.test/api/budgets', { method: 'POST', body: {}, authorized: false }) }),
			budgetsRoute.PUT({ request: makeRequest('https://example.test/api/budgets', { method: 'PUT', body: { id: 1 }, authorized: false }) }),
			budgetsRoute.DELETE({ request: makeRequest('https://example.test/api/budgets', { method: 'DELETE', body: { id: 1 }, authorized: false }) })
		];
		const responses = await Promise.all(operations);
		expect(responses.map((response) => response.status)).toEqual([401, 401, 401]);
		expect(mocks.sql).not.toHaveBeenCalled();
	});

	it('reports a database error when listing budgets fails', async () => {
		mocks.sql.mockImplementation(() => { throw new Error('list failed'); });
		const response = await budgetsRoute.GET({ request: makeRequest('https://example.test/api/budgets') });
		expect(response.status).toBe(500);
		expect(await responseJson(response)).toEqual({ error: 'Error: list failed' });
	});

	it('requires category, amount, and period', async () => {
		const response = await budgetsRoute.POST({
			request: makeRequest('https://example.test/api/budgets', { method: 'POST', body: { kategori_id: 1 } })
		});
		expect(response.status).toBe(400);
		expect(await responseJson(response)).toEqual({ error: 'Category, amount, and period are required.' });
	});

	it.each(['annual', 'daily'] as const)('rejects unsupported budget period: %s', async (periode) => {
		const response = await budgetsRoute.POST({
			request: makeRequest('https://example.test/api/budgets', {
				method: 'POST', body: { kategori_id: 1, jumlah: 250, periode }
			})
		});
		expect(response.status).toBe(400);
		expect(await responseJson(response)).toEqual({ error: 'Period must be monthly or weekly.' });
	});

	it('creates a budget and fills omitted month/year with null', async () => {
		const budget = { id: 5, kategori_id: 2, jumlah: 900000, periode: 'bulanan', bulan: null, tahun: null };
		mocks.sql.mockResolvedValue([budget]);
		const response = await budgetsRoute.POST({
			request: makeRequest('https://example.test/api/budgets', {
				method: 'POST', body: { kategori_id: 2, jumlah: 900000, periode: 'bulanan' }
			})
		});
		expect(response.status).toBe(201);
		expect(await responseJson(response)).toEqual({ ok: true, budget });
		expect(mocks.sql.mock.calls[0].slice(1)).toEqual([2, 900000, 'bulanan', null, null]);
	});

	it('reports an error when budget creation fails', async () => {
		mocks.sql.mockImplementation(() => { throw new Error('insert failed'); });
		const response = await budgetsRoute.POST({
			request: makeRequest('https://example.test/api/budgets', {
				method: 'POST', body: { kategori_id: 1, jumlah: 500, periode: 'mingguan' }
			})
		});
		expect(response.status).toBe(500);
		expect(await responseJson(response)).toEqual({ error: 'Error: insert failed' });
	});

	it('requires an id before updating a budget', async () => {
		const response = await budgetsRoute.PUT({
			request: makeRequest('https://example.test/api/budgets', { method: 'PUT', body: { jumlah: 1000 } })
		});
		expect(response.status).toBe(400);
		expect(await responseJson(response)).toEqual({ error: 'id required' });
	});

	it('returns not found for an unknown budget update', async () => {
		mocks.sql.mockResolvedValue([]);
		const response = await budgetsRoute.PUT({
			request: makeRequest('https://example.test/api/budgets', { method: 'PUT', body: { id: 77, jumlah: 1000 } })
		});
		expect(response.status).toBe(404);
	});

	it('updates a budget with the returned database row', async () => {
		const budget = { id: 5, kategori_id: 2, jumlah: 1000000, periode: 'bulanan', bulan: 3, tahun: 2026 };
		mocks.sql.mockResolvedValue([budget]);
		const response = await budgetsRoute.PUT({
			request: makeRequest('https://example.test/api/budgets', {
				method: 'PUT', body: { id: 5, jumlah: 1000000 }
			})
		});
		expect(response.status).toBe(200);
		expect(await responseJson(response)).toEqual({ ok: true, budget });
	});

	it('reports an error when budget update fails', async () => {
		mocks.sql.mockImplementation(() => { throw new Error('update failed'); });
		const response = await budgetsRoute.PUT({
			request: makeRequest('https://example.test/api/budgets', { method: 'PUT', body: { id: 5, jumlah: 1000 } })
		});
		expect(response.status).toBe(500);
		expect(await responseJson(response)).toEqual({ error: 'Error: update failed' });
	});

	it('validates and deletes a budget by id', async () => {
		const invalid = await budgetsRoute.DELETE({
			request: makeRequest('https://example.test/api/budgets', { method: 'DELETE', body: {} })
		});
		expect(invalid.status).toBe(400);

		mocks.sql.mockResolvedValueOnce([]);
		const missing = await budgetsRoute.DELETE({
			request: makeRequest('https://example.test/api/budgets', { method: 'DELETE', body: { id: 88 } })
		});
		expect(missing.status).toBe(404);

		mocks.sql.mockResolvedValueOnce([{ id: 5 }]);
		const deleted = await budgetsRoute.DELETE({
			request: makeRequest('https://example.test/api/budgets', { method: 'DELETE', body: { id: 5 } })
		});
		expect(deleted.status).toBe(200);
		expect(await responseJson(deleted)).toEqual({ ok: true });
	});

	it('reports an error when budget deletion fails', async () => {
		mocks.sql.mockImplementation(() => { throw new Error('delete failed'); });
		const response = await budgetsRoute.DELETE({
			request: makeRequest('https://example.test/api/budgets', { method: 'DELETE', body: { id: 5 } })
		});
		expect(response.status).toBe(500);
		expect(await responseJson(response)).toEqual({ error: 'Error: delete failed' });
	});
});

describe('summary, detail, and top-expenses APIs', () => {
	it('requires authentication before loading a summary', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const response = await summaryRoute.GET(event('https://example.test/api/summary', { authorized: false }));
		expect(response.status).toBe(401);
		expect(mocks.getSummary).not.toHaveBeenCalled();
	});

	it('forwards explicit summary filters and grouping', async () => {
		const result = { monthly: [{ month: '2026-02', total: 700 }], grand_total: 700 };
		mocks.getSummary.mockResolvedValue(result);
		const response = await summaryRoute.GET(event('https://example.test/api/summary?start=2026-02-01&end=2026-02-28&group_by=monthly'));
		expect(await responseJson(response)).toEqual(result);
		expect(mocks.getSummary).toHaveBeenCalledWith('2026-02-01', '2026-02-28', 'monthly');
	});

	it('defaults summary dates to the current month and today', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-15T12:00:00.000Z'));
		await summaryRoute.GET(event('https://example.test/api/summary'));
		expect(mocks.getSummary).toHaveBeenCalledWith('2026-03-01', '2026-03-15', undefined);
	});

	it('requires authentication before loading details', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const response = await detailRoute.GET(event('https://example.test/api/detail', { authorized: false }));
		expect(response.status).toBe(401);
		expect(mocks.getDetail).not.toHaveBeenCalled();
	});

	it('forwards detail date, source, page, and limit parameters', async () => {
		const result = { transactions: [{ id: 9 }], total: 1, page: 2, limit: 10 };
		mocks.getDetail.mockResolvedValue(result);
		const response = await detailRoute.GET(event('https://example.test/api/detail?start=2026-03-01&end=2026-03-31&sumber=BCA&page=2&limit=10'));
		expect(await responseJson(response)).toEqual(result);
		expect(mocks.getDetail).toHaveBeenCalledWith('2026-03-01', '2026-03-31', 'BCA', 2, 10);
	});

	it('defaults detail and top-expense dates to the current month', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-15T12:00:00.000Z'));
		await detailRoute.GET(event('https://example.test/api/detail'));
		await topExpensesRoute.GET(event('https://example.test/api/top-expenses'));
		expect(mocks.getDetail).toHaveBeenCalledWith('2026-03-01', '2026-03-15', undefined, 1, 50);
		expect(mocks.getTopExpensesData).toHaveBeenCalledWith('2026-03-01', '2026-03-15', 10);
	});

	it('requires authentication before loading top expenses', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const response = await topExpensesRoute.GET(event('https://example.test/api/top-expenses', { authorized: false }));
		expect(response.status).toBe(401);
		expect(mocks.getTopExpensesData).not.toHaveBeenCalled();
	});

	it('forwards the top-expense date range and limit', async () => {
		const result = { top_expenses: [{ deskripsi: 'Rent', jumlah: 1000, sumber: 'BCA' }] };
		mocks.getTopExpensesData.mockResolvedValue(result);
		const response = await topExpensesRoute.GET(event('https://example.test/api/top-expenses?start=2026-03-01&end=2026-03-31&limit=3'));
		expect(await responseJson(response)).toEqual(result);
		expect(mocks.getTopExpensesData).toHaveBeenCalledWith('2026-03-01', '2026-03-31', 3);
	});

	it('uses the top-expense default limit', async () => {
		await topExpensesRoute.GET(event('https://example.test/api/top-expenses?start=2026-03-01&end=2026-03-31'));
		expect(mocks.getTopExpensesData).toHaveBeenCalledWith('2026-03-01', '2026-03-31', 10);
	});
});

describe('reports API', () => {
	const report = {
		monthly: [{ bulan: '2026-03', total: 250 }],
		summary: { total: 250 },
		period: { start: '2026-03-01', end: '2026-03-31' }
	};

	it('rejects unauthenticated report requests before querying', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const response = await reportsRoute.GET(event('https://example.test/api/reports?start=2026-03-01&end=2026-03-31', { authorized: false }));
		expect(response.status).toBe(401);
		expect(mocks.getMonthlyReport).not.toHaveBeenCalled();
	});

	it('requires both date parameters', async () => {
		const response = await reportsRoute.GET(event('https://example.test/api/reports?start=2026-03-01'));
		expect(response.status).toBe(400);
		expect(await responseJson(response)).toEqual({ error: 'start and end params required' });
	});

	it('returns JSON by default with no-store cache policy', async () => {
		mocks.getMonthlyReport.mockResolvedValue(report);
		const response = await reportsRoute.GET(event('https://example.test/api/reports?start=2026-03-01&end=2026-03-31'));
		expect(response.status).toBe(200);
		expect(response.headers.get('cache-control')).toBe('no-store');
		expect(await responseJson(response)).toEqual(report);
		expect(mocks.getMonthlyReport).toHaveBeenCalledWith('2026-03-01', '2026-03-31');
	});

	it('returns a CSV attachment with the expected filename', async () => {
		mocks.getMonthlyReport.mockResolvedValue(report);
		mocks.buildCsvReport.mockReturnValue('Month,Total\n2026-03,250');
		const response = await reportsRoute.GET(event('https://example.test/api/reports?start=2026-03-01&end=2026-03-31&format=CSV'));
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('text/csv; charset=utf-8');
		expect(response.headers.get('content-disposition')).toBe('attachment; filename="expense-report-2026-03-01-to-2026-03-31.csv"');
		expect(await response.text()).toBe('Month,Total\n2026-03,250');
		expect(mocks.buildCsvReport).toHaveBeenCalledWith(report);
	});

	it('returns an XLSX attachment', async () => {
		mocks.getMonthlyReport.mockResolvedValue(report);
		const response = await reportsRoute.GET(event('https://example.test/api/reports?start=2026-03-01&end=2026-03-31&format=xlsx'));
		expect(response.headers.get('content-type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		expect(response.headers.get('content-disposition')).toContain('.xlsx');
		expect(Buffer.from(await response.arrayBuffer()).toString()).toBe('xlsx-content');
		expect(mocks.buildXlsxReport).toHaveBeenCalledWith(report);
	});

	it('returns a PDF attachment', async () => {
		mocks.getMonthlyReport.mockResolvedValue(report);
		const response = await reportsRoute.GET(event('https://example.test/api/reports?start=2026-03-01&end=2026-03-31&format=pdf'));
		expect(response.headers.get('content-type')).toBe('application/pdf');
		expect(response.headers.get('content-disposition')).toContain('.pdf');
		expect(Buffer.from(await response.arrayBuffer()).toString()).toBe('%PDF-test');
		expect(mocks.buildPdfReport).toHaveBeenCalledWith(report);
	});

	it('returns a server error if report generation fails', async () => {
		mocks.getMonthlyReport.mockImplementation(() => { throw new Error('report query failed'); });
		const response = await reportsRoute.GET(event('https://example.test/api/reports?start=2026-03-01&end=2026-03-31'));
		expect(response.status).toBe(500);
		expect(await responseJson(response)).toEqual({ error: 'Error: report query failed' });
	});
});
