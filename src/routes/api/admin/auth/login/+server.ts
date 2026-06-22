import { json } from "@sveltejs/kit";
import { generateToken, verifyAuth, verifyPassword } from "$lib/server/expense-tracker/auth";

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { password } = body;

		if (!password) {
			return json({ ok: false, error: "Password required" }, { status: 400 });
		}

		const valid = await verifyPassword(password);
		if (!valid) {
			return json({ ok: false, error: "Wrong password" }, { status: 401 });
		}

		const token = generateToken();
		return json({ ok: true, token });
	} catch (e) {
		return json({ ok: false, error: "Invalid request" }, { status: 400 });
	}
}

export async function GET({ request }) {
	const valid = verifyAuth(request);
	if (!valid) {
		return json({ ok: false, error: "Unauthorized" }, { status: 401 });
	}
	return json({ ok: true });
}
