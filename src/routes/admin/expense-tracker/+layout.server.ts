import { redirect } from '@sveltejs/kit';

export function load({ cookies, url }) {
	// Check if there's a token cookie (optional, client-side auth is primary)
	const token = cookies.get('expense_token');
	return {
		authenticated: !!token,
		path: url.pathname
	};
}
