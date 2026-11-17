import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/expense-tracker/auth';
import { getDetail } from '$lib/server/expense-tracker/queries';
import { getCurrentMonthDateRange } from '$lib/server/listing';

export async function GET({ request, url }) {
	if (!verifyAuth(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const currentMonth = getCurrentMonthDateRange();
	const start = url.searchParams.get('start') || currentMonth.start;
	const end = url.searchParams.get('end') || currentMonth.end;
	const sumber = url.searchParams.get('sumber') || undefined;
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = parseInt(url.searchParams.get('limit') || '50', 10);

	const data = await getDetail(start, end, sumber, page, limit);
	return json(data);
}
