import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/expense-tracker/auth';
import { getTopExpensesData } from '$lib/server/expense-tracker/queries';
import { getCurrentMonthDateRange } from '$lib/server/listing';

export async function GET({ request, url }) {
	if (!verifyAuth(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const currentMonth = getCurrentMonthDateRange();
	const start = url.searchParams.get('start') || currentMonth.start;
	const end = url.searchParams.get('end') || currentMonth.end;
	const limit = parseInt(url.searchParams.get('limit') || '10', 10);

	const data = await getTopExpensesData(start, end, limit);
	return json(data);
}
