import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'$lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
			'$env/static/private': fileURLToPath(new URL('./tests/mocks/static-private.ts', import.meta.url))
		}
	},
	test: {
		include: ['tests/**/*.test.ts'],
		environment: 'node',
		clearMocks: true,
		restoreMocks: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			thresholds: {
				statements: 100,
				branches: 100,
				functions: 100,
				lines: 100
			},
			include: [
				'src/lib/seo.ts',
				'src/lib/server/listing.ts',
				'src/lib/blog-meta.ts',
				'src/lib/projects.ts',
				'src/lib/server/expense-tracker/auth.ts',
				'src/lib/server/expense-tracker/dedup.ts',
				'src/lib/server/expense-tracker/queries.ts',
				'src/lib/server/expense-tracker/reports.ts',
				'src/routes/api/expense-tracker/reports/+server.ts',
				'src/routes/api/expense-tracker/auth/+server.ts',
				'src/routes/api/expense-tracker/settings/+server.ts',
				'src/routes/api/expense-tracker/categories/+server.ts',
				'src/routes/api/expense-tracker/budgets/+server.ts',
				'src/routes/api/expense-tracker/summary/+server.ts',
				'src/routes/api/expense-tracker/detail/+server.ts',
				'src/routes/api/expense-tracker/top-expenses/+server.ts',
				'src/routes/api/posts/+server.ts',
				'src/routes/api/posts/[id]/+server.ts',
				'src/routes/api/news/+server.ts',
				'src/routes/api/ihsg/+server.ts',
				'src/routes/api/admin/auth/login/+server.ts'
			],
			exclude: ['**/*.test.ts']
		}
	}
});
