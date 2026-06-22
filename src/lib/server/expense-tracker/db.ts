import postgres from 'postgres';
import { EXPENSE_TRACKER_DATABASE_URL } from '$env/static/private';

const sql = postgres(EXPENSE_TRACKER_DATABASE_URL, {
	transform: { column: { to: null, from: null } }
});

export default sql;
