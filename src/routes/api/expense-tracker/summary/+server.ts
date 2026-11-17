import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/expense-tracker/auth';
import { getSummary } from '$lib/server/expense-tracker/queries';
import { getCurrentMonthDateRange } from '$lib/server/listing';

export async function GET({ request, url }) {
	if (!verifyAuth(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const currentMonth = getCurrentMonthDateRange();
	const start = url.searchParams.get('start') || currentMonth.start;
	const end = url.searchParams.get('end') || currentMonth.end;
	const groupBy = url.searchParams.get('group_by') as 'daily' | 'monthly' | 'yearly' | null;

	const data = await getSummary(start, end, groupBy || undefined);
	return json(data);
}
