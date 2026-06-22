import { json } from "@sveltejs/kit";
import { verifyAuth, verifyPassword, hashPassword } from "$lib/server/expense-tracker/auth";
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
  try {
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword)
      return json({ error: "currentPassword and newPassword required" }, { status: 400 });
    if (newPassword.length < 6)
      return json({ error: "Password minimal 6 karakter" }, { status: 400 });

    const valid = await verifyPassword(currentPassword);
    if (!valid) return json({ error: "Password saat ini salah" }, { status: 403 });

    const newHash = await hashPassword(newPassword);
    return json({ ok: true, message: "Password berhasil diubah. Token baru akan berlaku setelah login ulang." });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
}
