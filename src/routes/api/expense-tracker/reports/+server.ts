import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/expense-tracker/auth';
import {
	buildCsvReport,
	buildPdfReport,
	buildXlsxReport,
	getMonthlyReport,
	getReportFilename
} from '$lib/server/expense-tracker/reports';

function asFormat(value: string | null) {
	return (value || 'json').toLowerCase();
}

export async function GET({ request, url }) {
	if (!verifyAuth(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const start = url.searchParams.get('start');
	const end = url.searchParams.get('end');
	const format = asFormat(url.searchParams.get('format'));

	if (!start || !end) {
		return json({ error: 'start and end params required' }, { status: 400 });
	}

	try {
		const report = await getMonthlyReport(start, end);
		const filenameBase = getReportFilename(start, end, '');

		if (format === 'csv') {
			const csv = buildCsvReport(report);
			return new Response(csv, {
				status: 200,
				headers: {
					'Content-Type': 'text/csv; charset=utf-8',
					'Content-Disposition': `attachment; filename="${filenameBase}.csv"`
				}
			});
		}

		if (format === 'xlsx') {
			const buffer = await buildXlsxReport(report);
			return new Response(buffer, {
				status: 200,
				headers: {
					'Content-Type':
						'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
					'Content-Disposition': `attachment; filename="${filenameBase}.xlsx"`
				}
			});
		}

		if (format === 'pdf') {
			const buffer = await buildPdfReport(report);
			return new Response(buffer, {
				status: 200,
				headers: {
					'Content-Type': 'application/pdf',
					'Content-Disposition': `attachment; filename="${filenameBase}.pdf"`
				}
			});
		}

		return json(report, {
			headers: {
				'cache-control': 'no-store'
			}
		});
	} catch (error) {
		return json({ error: String(error) }, { status: 500 });
	}
}
