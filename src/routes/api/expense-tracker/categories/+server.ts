import { json } from "@sveltejs/kit";
import { verifyAuth } from "$lib/server/expense-tracker/auth";
import sql from "$lib/server/expense-tracker/db";

export async function GET({ request }) {
  if (!verifyAuth(request)) return json({ error: "Unauthorized" }, { status: 401 });
  try {
    const rows = await sql`SELECT id, nama, tipe, icon, created_at FROM finansial.kategori ORDER BY created_at DESC`;
    return json({ categories: rows });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
}

export async function POST({ request }) {
  if (!verifyAuth(request)) return json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { nama, tipe, icon } = await request.json();
    if (!nama || !tipe) return json({ error: "nama and tipe required" }, { status: 400 });
    if (!["pemasukan", "pengeluaran"].includes(tipe))
      return json({ error: "tipe must be pemasukan or pengeluaran" }, { status: 400 });
    const [row] = await sql`
      INSERT INTO finansial.kategori (nama, tipe, icon)
      VALUES (${nama}, ${tipe}, ${icon || null})
      RETURNING id, nama, tipe, icon, created_at
    `;
    return json({ ok: true, category: row }, { status: 201 });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT({ request }) {
  if (!verifyAuth(request)) return json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, nama, tipe, icon } = await request.json();
    if (!id) return json({ error: "id required" }, { status: 400 });
    const [row] = await sql`
      UPDATE finansial.kategori
      SET nama = COALESCE(${nama}, nama),
          tipe = COALESCE(${tipe}, tipe),
          icon = COALESCE(${icon}, icon)
      WHERE id = ${id}
      RETURNING id, nama, tipe, icon, created_at
    `;
    if (!row) return json({ error: "Not found" }, { status: 404 });
    return json({ ok: true, category: row });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE({ request }) {
  if (!verifyAuth(request)) return json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await request.json();
    if (!id) return json({ error: "id required" }, { status: 400 });
    const [row] = await sql`DELETE FROM finansial.kategori WHERE id = ${id} RETURNING id`;
    if (!row) return json({ error: "Not found" }, { status: 404 });
    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
}
