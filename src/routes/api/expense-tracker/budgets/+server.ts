import { json } from "@sveltejs/kit";
import { verifyAuth } from "$lib/server/expense-tracker/auth";
import sql from "$lib/server/expense-tracker/db";

export async function GET({ request }) {
  if (!verifyAuth(request)) return json({ error: "Unauthorized" }, { status: 401 });
  try {
    const rows = await sql`
      SELECT b.id, b.kategori_id, b.jumlah, b.periode, b.bulan, b.tahun, b.created_at,
             k.nama as kategori_nama, k.icon as kategori_icon, k.tipe as kategori_tipe
      FROM finansial.budget b
      LEFT JOIN finansial.kategori k ON k.id = b.kategori_id
      ORDER BY b.created_at DESC
    `;
    return json({ budgets: rows });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
}

export async function POST({ request }) {
  if (!verifyAuth(request)) return json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { kategori_id, jumlah, periode, bulan, tahun } = await request.json();
    if (!kategori_id || jumlah == null || !periode)
      return json({ error: "Category, amount, and period are required." }, { status: 400 });
    if (!["bulanan", "mingguan"].includes(periode))
      return json({ error: "Period must be monthly or weekly." }, { status: 400 });
    const [row] = await sql`
      INSERT INTO finansial.budget (kategori_id, jumlah, periode, bulan, tahun)
      VALUES (${kategori_id}, ${jumlah}, ${periode}, ${bulan || null}, ${tahun || null})
      RETURNING id, kategori_id, jumlah, periode, bulan, tahun, created_at
    `;
    return json({ ok: true, budget: row }, { status: 201 });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT({ request }) {
  if (!verifyAuth(request)) return json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, kategori_id, jumlah, periode, bulan, tahun } = await request.json();
    if (!id) return json({ error: "id required" }, { status: 400 });
    const [row] = await sql`
      UPDATE finansial.budget
      SET kategori_id = COALESCE(${kategori_id}, kategori_id),
          jumlah = COALESCE(${jumlah}, jumlah),
          periode = COALESCE(${periode}, periode),
          bulan = COALESCE(${bulan}, bulan),
          tahun = COALESCE(${tahun}, tahun)
      WHERE id = ${id}
      RETURNING id, kategori_id, jumlah, periode, bulan, tahun, created_at
    `;
    if (!row) return json({ error: "Not found" }, { status: 404 });
    return json({ ok: true, budget: row });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE({ request }) {
  if (!verifyAuth(request)) return json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await request.json();
    if (!id) return json({ error: "id required" }, { status: 400 });
    const [row] = await sql`DELETE FROM finansial.budget WHERE id = ${id} RETURNING id`;
    if (!row) return json({ error: "Not found" }, { status: 404 });
    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
}
