import { json } from '@sveltejs/kit';
import { verifyAuth } from '$lib/server/expense-tracker/auth';
import { getSummary } from '$lib/server/expense-tracker/queries';

export async function GET({ request, url }) {
	if (!verifyAuth(request)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const today = new Date();
	const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

	const start = url.searchParams.get('start') || firstDay.toISOString().slice(0, 10);
	const end = url.searchParams.get('end') || today.toISOString().slice(0, 10);
	const groupBy = url.searchParams.get('group_by') as 'daily' | 'monthly' | 'yearly' | null;

	const data = await getSummary(start, end, groupBy || undefined);
	return json(data);
}
