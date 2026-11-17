import { json } from "@sveltejs/kit";
import { verifyAuth } from "$lib/server/expense-tracker/auth";
import sql from "$lib/server/expense-tracker/db";

export async function GET({ request }) {
  if (!verifyAuth(request)) return json({ error: "Unauthorized" }, { status: 401 });
  try {
    await sql`SELECT 1`;
    return json({ db_status: "connected" });
  } catch (e) {
    return json({ db_status: "disconnected", error: String(e) });
  }
}

export async function POST({ request }) {
  if (!verifyAuth(request)) return json({ error: "Unauthorized" }, { status: 401 });
  return json(
    { error: "Password updates are unavailable because this tracker uses a fixed server-side password." },
    { status: 501 }
  );
}
