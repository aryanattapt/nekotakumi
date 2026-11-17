import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	const builders: unknown[] = [];
	const selectResults: unknown[] = [];
	const returningResults: unknown[] = [];
	const insertedValues: unknown[] = [];
	const updatedValues: unknown[] = [];
	const posts = { id: 'posts.id', published: 'posts.published', title: 'posts.title', excerpt: 'posts.excerpt', slug: 'posts.slug', createdAt: 'posts.createdAt' };
	const news = { id: 'news.id', title: 'news.title', excerpt: 'news.excerpt', slug: 'news.slug', category: 'news.category', publishedAt: 'news.publishedAt' };
	const ihsgData = { createdAt: 'ihsg.createdAt' };
	const db = { select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn() };
	const verifyAuth = vi.fn(() => true);
	const verifyPassword = vi.fn(async () => true);
	const generateToken = vi.fn(() => 'admin-token');
	const orm = {
		and: vi.fn((...args: unknown[]) => ({ op: 'and', args })),
		desc: vi.fn((column: unknown) => ({ op: 'desc', column })),
		eq: vi.fn((column: unknown, value: unknown) => ({ op: 'eq', column, value })),
		ilike: vi.fn((column: unknown, value: unknown) => ({ op: 'ilike', column, value })),
		or: vi.fn((...args: unknown[]) => ({ op: 'or', args })),
		sql: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({ op: 'sql', strings: [...strings], values }))
	};
	return {
		builders, selectResults, returningResults, insertedValues, updatedValues,
		posts, news, ihsgData, db, orm, verifyAuth, verifyPassword, generateToken
	};
});

vi.mock('$lib/server/db', () => ({ db: mocks.db }));
vi.mock('$lib/server/db/schema', () => ({ posts: mocks.posts, news: mocks.news, ihsgData: mocks.ihsgData }));
vi.mock('drizzle-orm', () => mocks.orm);
vi.mock('$lib/server/expense-tracker/auth', () => ({
	verifyAuth: mocks.verifyAuth,
	verifyPassword: mocks.verifyPassword,
	generateToken: mocks.generateToken
}));

import * as postsRoute from '../../src/routes/api/posts/+server';
import * as postRoute from '../../src/routes/api/posts/[id]/+server';
import * as newsRoute from '../../src/routes/api/news/+server';
import * as ihsgRoute from '../../src/routes/api/ihsg/+server';
import * as adminLoginRoute from '../../src/routes/api/admin/auth/login/+server';

function queryBuilder(result: unknown) {
	const builder: Record<string, any> = {
		from: vi.fn(() => builder),
		where: vi.fn(() => builder),
		orderBy: vi.fn(() => builder),
		limit: vi.fn(() => builder),
		offset: vi.fn(() => builder),
		then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
			Promise.resolve(result).then(resolve, reject)
	};
	mocks.builders.push(builder);
	return builder;
}

function request(url: string, options: { method?: string; body?: unknown; authorized?: boolean } = {}) {
	const headers = new Headers();
	if (options.authorized !== false) headers.set('authorization', 'Bearer test-token');
	return new Request(url, {
		method: options.method || 'GET',
		headers,
		body: options.body === undefined ? undefined : JSON.stringify(options.body)
	});
}

async function body(response: Response) {
	return response.json();
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.verifyAuth.mockReturnValue(true);
	mocks.verifyPassword.mockResolvedValue(true);
	mocks.generateToken.mockReturnValue('admin-token');
	mocks.builders.length = 0;
	mocks.selectResults.length = 0;
	mocks.returningResults.length = 0;
	mocks.insertedValues.length = 0;
	mocks.updatedValues.length = 0;
	mocks.db.select.mockImplementation(() => queryBuilder(mocks.selectResults.shift() ?? []));
	mocks.db.insert.mockImplementation(() => ({
		values: vi.fn((values: unknown) => {
			mocks.insertedValues.push(values);
			return { returning: vi.fn(() => Promise.resolve(mocks.returningResults.shift() ?? [])) };
		})
	}));
	mocks.db.update.mockImplementation(() => ({
		set: vi.fn((values: unknown) => {
			mocks.updatedValues.push(values);
			return { where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve(mocks.returningResults.shift() ?? [])) })) };
		})
	}));
	mocks.db.delete.mockImplementation(() => ({
		where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve(mocks.returningResults.shift() ?? [])) }))
	}));
});

describe('public posts API', () => {
	it('returns published posts, counts, pagination metadata, and public cache headers', async () => {
		const items = [{ id: 4, title: 'Build notes', published: true }];
		mocks.selectResults.push(items, [{ count: '21' }]);
		const response = await postsRoute.GET({ url: new URL('https://example.test/api/posts') });

		expect(response.status).toBe(200);
		expect(response.headers.get('cache-control')).toBe('public, max-age=30, stale-while-revalidate=120');
		expect(await body(response)).toEqual({ items, page: 1, totalPages: 2, q: '', total: 21, limit: 20 });
		expect(mocks.db.select).toHaveBeenCalledTimes(2);
		expect(mocks.orm.eq).toHaveBeenCalledWith(mocks.posts.published, true);
		expect(mocks.builders[0].limit).toHaveBeenCalledWith(20);
		expect(mocks.builders[0].offset).toHaveBeenCalledWith(0);
	});

	it('normalizes query text and applies requested pagination and search conditions', async () => {
		mocks.selectResults.push([{ id: 1 }], [{ count: 55 }]);
		const response = await postsRoute.GET({
			url: new URL('https://example.test/api/posts?q=%20svelte%20&page=2&limit=500')
		});
		expect(await body(response)).toEqual({ items: [{ id: 1 }], page: 2, totalPages: 2, q: 'svelte', total: 55, limit: 50 });
		expect(mocks.orm.ilike).toHaveBeenCalledWith(mocks.posts.title, '%svelte%');
		expect(mocks.orm.ilike).toHaveBeenCalledWith(mocks.posts.excerpt, '%svelte%');
		expect(mocks.builders[0].limit).toHaveBeenCalledWith(50);
		expect(mocks.builders[0].offset).toHaveBeenCalledWith(50);
	});

	it('returns zero total pages when there are no published posts', async () => {
		mocks.selectResults.push([], []);
		const response = await postsRoute.GET({ url: new URL('https://example.test/api/posts?page=0') });
		expect(await body(response)).toMatchObject({ page: 1, totalPages: 0, total: 0 });
	});

	it('requires authentication before creating a post', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const response = await postsRoute.POST({
			request: request('https://example.test/api/posts', { method: 'POST', authorized: false, body: {} })
		});
		expect(response.status).toBe(401);
		expect(await body(response)).toEqual({ error: 'Unauthorized' });
		expect(mocks.db.select).not.toHaveBeenCalled();
	});

	it('validates required post fields and rejects blank strings', async () => {
		const missing = await postsRoute.POST({
			request: request('https://example.test/api/posts', { method: 'POST', body: { title: 'Title' } })
		});
		expect(missing.status).toBe(400);
		expect(await body(missing)).toEqual({ error: 'title, slug, content required' });

		const blank = await postsRoute.POST({
			request: request('https://example.test/api/posts', {
				method: 'POST', body: { title: '  ', slug: 'slug', content: 'content' }
			})
		});
		expect(blank.status).toBe(400);
		expect(mocks.db.select).not.toHaveBeenCalled();
	});

	it('rejects duplicate post slugs', async () => {
		mocks.selectResults.push([{ id: 1, slug: 'already-used' }]);
		const response = await postsRoute.POST({
			request: request('https://example.test/api/posts', {
				method: 'POST', body: { title: 'A title', slug: 'already-used', content: 'Text' }
			})
		});
		expect(response.status).toBe(409);
		expect(await body(response)).toEqual({ error: 'Duplicate slug' });
		expect(mocks.db.insert).not.toHaveBeenCalled();
	});

	it('trims post content and applies safe optional-field defaults', async () => {
		const created = { id: 9, title: 'New', slug: 'new', content: 'Text', excerpt: null, published: false };
		mocks.selectResults.push([]);
		mocks.returningResults.push([created]);
		const response = await postsRoute.POST({
			request: request('https://example.test/api/posts', {
				method: 'POST', body: { title: ' New ', slug: ' new ', content: ' Text ', excerpt: ' ', published: 'yes' }
			})
		});
		expect(response.status).toBe(201);
		expect(await body(response)).toEqual(created);
		expect(mocks.insertedValues).toEqual([{ title: 'New', slug: 'new', content: 'Text', excerpt: null, published: false }]);
	});

	it('stores an explicit boolean published flag and trimmed excerpt', async () => {
		mocks.selectResults.push([]);
		mocks.returningResults.push([{ id: 10 }]);
		await postsRoute.POST({
			request: request('https://example.test/api/posts', {
				method: 'POST', body: { title: 'Title', slug: 'slug', content: 'Body', excerpt: ' Summary ', published: true }
			})
		});
		expect(mocks.insertedValues[0]).toEqual({ title: 'Title', slug: 'slug', content: 'Body', excerpt: 'Summary', published: true });
	});
});

describe('single post API', () => {
	it('requires authentication for post reads', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const response = await postRoute.GET({
			params: { id: '1' },
			request: request('https://example.test/api/posts/1', { authorized: false })
		});
		expect(response.status).toBe(401);
		expect(mocks.db.select).not.toHaveBeenCalled();
	});

	it.each(['0', '-1', 'abc', '3tail', '1.5', '9007199254740992'])('rejects invalid post id %s', async (id) => {
		const response = await postRoute.GET({ params: { id }, request: request(`https://example.test/api/posts/${id}`) });
		expect(response.status).toBe(400);
		expect(await body(response)).toEqual({ error: 'Invalid id' });
	});

	it('returns 404 when an authenticated post lookup has no row', async () => {
		mocks.selectResults.push([]);
		const response = await postRoute.GET({ params: { id: '3' }, request: request('https://example.test/api/posts/3') });
		expect(response.status).toBe(404);
		expect(await body(response)).toEqual({ error: 'Not found' });
	});

	it('returns a post for a valid id', async () => {
		const post = { id: 3, title: 'Title', slug: 'title' };
		mocks.selectResults.push([post]);
		const response = await postRoute.GET({ params: { id: '3' }, request: request('https://example.test/api/posts/3') });
		expect(response.status).toBe(200);
		expect(await body(response)).toEqual(post);
	});

	it('rejects unauthenticated post updates and deletes', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const [update, remove] = await Promise.all([
			postRoute.PUT({ params: { id: '3' }, request: request('https://example.test/api/posts/3', { method: 'PUT', body: {}, authorized: false }) }),
			postRoute.DELETE({ params: { id: '3' }, request: request('https://example.test/api/posts/3', { method: 'DELETE', authorized: false }) })
		]);
		expect([update.status, remove.status]).toEqual([401, 401]);
		expect(mocks.db.update).not.toHaveBeenCalled();
		expect(mocks.db.delete).not.toHaveBeenCalled();
	});

	it('validates ids before attempting a post update or delete', async () => {
		const update = await postRoute.PUT({ params: { id: 'nope' }, request: request('https://example.test/api/posts/nope', { method: 'PUT', body: {} }) });
		const remove = await postRoute.DELETE({ params: { id: 'nope' }, request: request('https://example.test/api/posts/nope', { method: 'DELETE' }) });
		expect([update.status, remove.status]).toEqual([400, 400]);
		expect(mocks.db.update).not.toHaveBeenCalled();
		expect(mocks.db.delete).not.toHaveBeenCalled();
	});

	it('returns 404 when updating a post that does not exist', async () => {
		mocks.returningResults.push([]);
		const response = await postRoute.PUT({
			params: { id: '3' },
			request: request('https://example.test/api/posts/3', { method: 'PUT', body: { title: 'Renamed' } })
		});
		expect(response.status).toBe(404);
		expect(await body(response)).toEqual({ error: 'Not found' });
	});

	it('updates only supplied post fields and refreshes updatedAt', async () => {
		const updatedAt = new Date();
		mocks.returningResults.push([{ id: 3, title: 'Renamed' }]);
		const response = await postRoute.PUT({
			params: { id: '3' },
			request: request('https://example.test/api/posts/3', {
				method: 'PUT', body: { title: ' Renamed ', slug: ' ', content: null, excerpt: null, published: 0 }
			})
		});
		expect(response.status).toBe(200);
		expect(await body(response)).toEqual({ id: 3, title: 'Renamed' });
		expect(mocks.updatedValues[0]).toMatchObject({ title: 'Renamed', content: null, excerpt: null, published: false });
		expect(mocks.updatedValues[0].updatedAt).toBeInstanceOf(Date);
		expect(mocks.updatedValues[0].updatedAt.getTime()).toBeGreaterThanOrEqual(updatedAt.getTime());
	});

	it('leaves omitted or wrongly typed post fields unchanged', async () => {
		mocks.returningResults.push([{ id: 3 }]);
		await postRoute.PUT({
			params: { id: '3' },
			request: request('https://example.test/api/posts/3', {
				method: 'PUT', body: { title: 123, slug: null }
			})
		});
		expect(mocks.updatedValues[0]).toEqual(expect.objectContaining({ updatedAt: expect.any(Date) }));
		expect(Object.keys(mocks.updatedValues[0])).toEqual(['updatedAt']);
	});

	it('trims and updates a supplied post slug', async () => {
		mocks.returningResults.push([{ id: 3, slug: 'new-slug' }]);
		await postRoute.PUT({
			params: { id: '3' },
			request: request('https://example.test/api/posts/3', {
				method: 'PUT', body: { slug: ' new-slug ' }
			})
		});
		expect(mocks.updatedValues[0].slug).toBe('new-slug');
	});

	it('returns 404 when deleting an unknown post and confirms successful deletion', async () => {
		mocks.returningResults.push([]);
		const missing = await postRoute.DELETE({ params: { id: '3' }, request: request('https://example.test/api/posts/3', { method: 'DELETE' }) });
		expect(missing.status).toBe(404);

		mocks.returningResults.push([{ id: 3, title: 'Removed' }]);
		const deleted = await postRoute.DELETE({ params: { id: '3' }, request: request('https://example.test/api/posts/3', { method: 'DELETE' }) });
		expect(deleted.status).toBe(200);
		expect(await body(deleted)).toEqual({ message: 'Deleted', post: { id: 3, title: 'Removed' } });
	});
});

describe('news API', () => {
	it('lists news with no optional filters using the all-rows condition', async () => {
		mocks.selectResults.push([{ id: 2 }], [{ count: 0 }]);
		const response = await newsRoute.GET({ url: new URL('https://example.test/api/news') });
		expect(await body(response)).toEqual({ items: [{ id: 2 }], page: 1, totalPages: 0, q: '', total: 0, category: '', limit: 20 });
		expect(mocks.orm.sql).toHaveBeenCalledTimes(3);
		expect(mocks.builders[0].where).toHaveBeenCalledWith(expect.objectContaining({ op: 'sql' }));
	});

	it('normalizes category and search query before filtering', async () => {
		mocks.selectResults.push([{ id: 6 }], [{ count: '8' }]);
		const response = await newsRoute.GET({
			url: new URL('https://example.test/api/news?category=%20Tech%20&q=%20AI%20&page=2&limit=5')
		});
		expect(await body(response)).toEqual({ items: [{ id: 6 }], page: 2, totalPages: 2, q: 'AI', total: 8, category: 'Tech', limit: 5 });
		expect(mocks.orm.eq).toHaveBeenCalledWith(mocks.news.category, 'Tech');
		expect(mocks.orm.ilike).toHaveBeenCalledWith(mocks.news.title, '%AI%');
		expect(mocks.orm.ilike).toHaveBeenCalledWith(mocks.news.excerpt, '%AI%');
		expect(mocks.builders[0].offset).toHaveBeenCalledWith(5);
	});

	it('requires authentication and valid fields before creating news', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const unauthorized = await newsRoute.POST({ request: request('https://example.test/api/news', { method: 'POST', body: {}, authorized: false }) });
		expect(unauthorized.status).toBe(401);
		mocks.verifyAuth.mockReturnValue(true);
		const invalid = await newsRoute.POST({ request: request('https://example.test/api/news', { method: 'POST', body: { title: 'A title' } }) });
		expect(invalid.status).toBe(400);
		const blank = await newsRoute.POST({
			request: request('https://example.test/api/news', {
				method: 'POST', body: { title: ' ', slug: 'valid-slug', content: 'valid content' }
			})
		});
		expect(blank.status).toBe(400);
		expect(mocks.db.select).not.toHaveBeenCalled();
	});

	it('rejects duplicate news slugs', async () => {
		mocks.selectResults.push([{ id: 2 }]);
		const response = await newsRoute.POST({
			request: request('https://example.test/api/news', {
				method: 'POST', body: { title: 'Tech', slug: 'tech', content: 'Body' }
			})
		});
		expect(response.status).toBe(409);
		expect(await body(response)).toEqual({ error: 'Duplicate slug' });
	});

	it('trims news fields and applies source/category/date defaults', async () => {
		const publishedAt = new Date('2026-05-01T00:00:00.000Z');
		mocks.selectResults.push([]);
		mocks.returningResults.push([{ id: 3 }]);
		const response = await newsRoute.POST({
			request: request('https://example.test/api/news', {
				method: 'POST',
				body: {
					title: ' Tech ', slug: ' tech ', content: ' Story ', excerpt: ' Summary ',
					sourceUrl: ' https://source.test ', sourceName: ' Source ', imageUrl: ' https://image.test ',
					category: ' ', publishedAt: publishedAt.toISOString()
				}
			})
		});
		expect(response.status).toBe(201);
		expect(await body(response)).toEqual({ id: 3 });
		expect(mocks.insertedValues[0]).toEqual({
			title: 'Tech', slug: 'tech', content: 'Story', excerpt: 'Summary',
			sourceUrl: 'https://source.test', sourceName: 'Source', imageUrl: 'https://image.test',
			category: 'general', publishedAt
		});
	});

	it('uses current time when no publication date is supplied', async () => {
		const before = Date.now();
		mocks.selectResults.push([]);
		mocks.returningResults.push([{ id: 4 }]);
		await newsRoute.POST({
			request: request('https://example.test/api/news', {
				method: 'POST', body: { title: 'Tech', slug: 'tech', content: 'Body', category: 'Dev' }
			})
		});
		const inserted = mocks.insertedValues[0] as { publishedAt: Date };
		expect(inserted.publishedAt).toBeInstanceOf(Date);
		expect(inserted.publishedAt.getTime()).toBeGreaterThanOrEqual(before);
	});
});

describe('IHSG API', () => {
	it('returns 404 when no data has been recorded', async () => {
		mocks.selectResults.push([]);
		const response = await ihsgRoute.GET();
		expect(response.status).toBe(404);
		expect(await body(response)).toEqual({ error: 'No IHSG data yet' });
	});

	it('returns the latest data with short-lived public caching', async () => {
		const latest = { ihsg: '7200.3', usdIdr: '16000' };
		mocks.selectResults.push([latest]);
		const response = await ihsgRoute.GET();
		expect(response.status).toBe(200);
		expect(response.headers.get('cache-control')).toBe('public, max-age=15, stale-while-revalidate=60');
		expect(await body(response)).toEqual(latest);
	});

	it('converts database lookup failures into a generic server error', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		mocks.db.select.mockImplementationOnce(() => { throw new Error('database details'); });
		const response = await ihsgRoute.GET();
		expect(response.status).toBe(500);
		expect(await body(response)).toEqual({ error: 'Internal error' });
		expect(consoleError).toHaveBeenCalledWith('IHSG GET failed', expect.any(Error));
	});

	it('rejects unauthenticated scraper updates', async () => {
		mocks.verifyAuth.mockReturnValue(false);
		const response = await ihsgRoute.POST({ request: request('https://example.test/api/ihsg', { method: 'POST', body: {}, authorized: false }) });
		expect(response.status).toBe(401);
		expect(await body(response)).toEqual({ error: 'Unauthorized' });
		expect(mocks.db.insert).not.toHaveBeenCalled();
	});

	it('maps nested scraper values and creates an IHSG record', async () => {
		const row = { ihsg: '7200.3' };
		mocks.returningResults.push([row]);
		const response = await ihsgRoute.POST({
			request: request('https://example.test/api/ihsg', {
				method: 'POST',
				body: {
					ihsg: { value: 7200.3, change: -12.2, pct: -0.17, high: 7220, low: 7180 },
					usd: { price: 16000, change: 50, pct: 0.31 },
					gold: 1500000,
					summary: { up: 200, down: 300, flat: 100, total: 600 }
				}
			})
		});
		expect(response.status).toBe(201);
		expect(await body(response)).toEqual(row);
		expect(mocks.insertedValues[0]).toEqual({
			ihsg: 7200.3, ihsgChange: -12.2, ihsgChangePercent: -0.17, high: 7220, low: 7180,
			usdIdr: 16000, usdIdrChange: 50, usdIdrChangePercent: 0.31, gold: 1500000,
			goldChange: null, goldChangePercent: null, upCount: 200, downCount: 300, flatCount: 100, totalCount: 600
		});
	});

	it('accepts flat snake-case scraper fields and fills missing values with null', async () => {
		mocks.returningResults.push([{ id: 7 }]);
		await ihsgRoute.POST({
			request: request('https://example.test/api/ihsg', {
				method: 'POST',
				body: { ihsg: 7000, ihsg_change: 10, ihsg_change_percent: 0.2, usd_idr: 15900, usd_idr_change: -5, usd_idr_change_percent: -0.03, gold_change: 2, gold_change_percent: 0.01, up_count: 1, down_count: 2, flat_count: 3, total_count: 6 }
			})
		});
		expect(mocks.insertedValues[0]).toEqual({
			ihsg: 7000, ihsgChange: 10, ihsgChangePercent: 0.2, high: null, low: null,
			usdIdr: 15900, usdIdrChange: -5, usdIdrChangePercent: -0.03, gold: null,
			goldChange: 2, goldChangePercent: 0.01, upCount: 1, downCount: 2, flatCount: 3, totalCount: 6
		});
	});

	it('accepts flat camelCase scraper fields', async () => {
		mocks.returningResults.push([{ id: 8 }]);
		await ihsgRoute.POST({
			request: request('https://example.test/api/ihsg', {
				method: 'POST',
				body: {
					ihsg: 7001, ihsgChange: 4, ihsgChangePercent: 0.06, high: 7010, low: 6990,
					usdIdr: 16010, usdIdrChange: 3, usdIdrChangePercent: 0.02,
					gold: 1510000, goldChange: 10, goldChangePercent: 0.03,
					upCount: 5, downCount: 4, flatCount: 3, totalCount: 12
				}
			})
		});
		expect(mocks.insertedValues[0]).toEqual({
			ihsg: 7001, ihsgChange: 4, ihsgChangePercent: 0.06, high: 7010, low: 6990,
			usdIdr: 16010, usdIdrChange: 3, usdIdrChangePercent: 0.02,
			gold: 1510000, goldChange: 10, goldChangePercent: 0.03,
			upCount: 5, downCount: 4, flatCount: 3, totalCount: 12
		});
	});

	it('stores null for every omitted IHSG metric', async () => {
		mocks.returningResults.push([{ id: 9 }]);
		await ihsgRoute.POST({
			request: request('https://example.test/api/ihsg', { method: 'POST', body: {} })
		});
		expect(mocks.insertedValues[0]).toEqual({
			ihsg: null, ihsgChange: null, ihsgChangePercent: null, high: null, low: null,
			usdIdr: null, usdIdrChange: null, usdIdrChangePercent: null,
			gold: null, goldChange: null, goldChangePercent: null,
			upCount: null, downCount: null, flatCount: null, totalCount: null
		});
	});

	it('converts malformed update requests and database failures into server errors', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		const malformed = await ihsgRoute.POST({
			request: new Request('https://example.test/api/ihsg', { method: 'POST', body: '{bad json', headers: { authorization: 'Bearer test-token' } })
		});
		expect(malformed.status).toBe(500);
		expect(await body(malformed)).toEqual({ error: 'Internal error' });

		mocks.db.insert.mockImplementationOnce(() => { throw new Error('database details'); });
		const failed = await ihsgRoute.POST({
			request: request('https://example.test/api/ihsg', { method: 'POST', body: { ihsg: 7200 } })
		});
		expect(failed.status).toBe(500);
		expect(await body(failed)).toEqual({ error: 'Internal error' });
		expect(consoleError).toHaveBeenCalledWith('IHSG POST failed', expect.any(Error));
	});
});

describe('admin login API', () => {
	it('requires a password and rejects malformed JSON', async () => {
		const missing = await adminLoginRoute.POST({ request: request('https://example.test/api/admin/login', { method: 'POST', body: {} }) });
		expect(missing.status).toBe(400);
		expect(await body(missing)).toEqual({ ok: false, error: 'Password required' });

		const malformed = await adminLoginRoute.POST({
			request: new Request('https://example.test/api/admin/login', { method: 'POST', body: '{broken' })
		});
		expect(malformed.status).toBe(400);
		expect(await body(malformed)).toEqual({ ok: false, error: 'Invalid request' });
	});

	it('returns unauthorized for an incorrect password and a token for a valid one', async () => {
		mocks.verifyPassword.mockResolvedValueOnce(false);
		const wrong = await adminLoginRoute.POST({
			request: request('https://example.test/api/admin/login', { method: 'POST', body: { password: 'wrong' } })
		});
		expect(wrong.status).toBe(401);
		expect(await body(wrong)).toEqual({ ok: false, error: 'Wrong password' });

		const success = await adminLoginRoute.POST({
			request: request('https://example.test/api/admin/login', { method: 'POST', body: { password: 'right' } })
		});
		expect(success.status).toBe(200);
		expect(await body(success)).toEqual({ ok: true, token: 'admin-token' });
	});

	it('checks admin session authorization', async () => {
		const authorized = await adminLoginRoute.GET({ request: request('https://example.test/api/admin/login') });
		expect(authorized.status).toBe(200);
		expect(await body(authorized)).toEqual({ ok: true });

		mocks.verifyAuth.mockReturnValue(false);
		const unauthorized = await adminLoginRoute.GET({ request: request('https://example.test/api/admin/login', { authorized: false }) });
		expect(unauthorized.status).toBe(401);
		expect(await body(unauthorized)).toEqual({ ok: false, error: 'Unauthorized' });
	});
});
