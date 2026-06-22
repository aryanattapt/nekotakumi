import {json} from '@sveltejs/kit';
import {verifyAuth} from '$lib/server/expense-tracker/auth';
import sql from '$lib/server/expense-tracker/db';

export async function GET({request, url}) {
  if (!verifyAuth(request)) return json({error: 'Unauthorized'}, {status: 401});

  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');
  const format = url.searchParams.get('format') || 'json';

  if (!start || !end) return json({error: 'start and end params required'}, {status: 400});

  try {
    const rows = await sql`
      SELECT
        to_char(tanggal, 'YYYY-MM') as bulan,
        SUM(CASE WHEN jenis = 'pemasukan' THEN jumlah ELSE 0 END) as total_pemasukan,
        SUM(CASE WHEN jenis = 'pengeluaran' THEN jumlah ELSE 0 END) as total_pengeluaran
      FROM finansial.transaksi
      WHERE tanggal >= ${start}::date AND tanggal <= ${end}::date
      GROUP BY to_char(tanggal, 'YYYY-MM')
      ORDER BY bulan
    `;

    const monthly = rows.map((r: any) => ({
      bulan: r.bulan,
      total_pemasukan: Number(r.total_pemasukan),
      total_pengeluaran: Number(r.total_pengeluaran),
      selisiz: Number(r.total_pemasukan) - Number(r.total_pengeluaran)
    }));

    const grandTotalPemasukan = monthly.reduce((s: number, m: any) => s + m.total_pemasukan, 0);
    const grandTotalPengeluaran = monthly.reduce((s: number, m: any) => s + m.total_pengeluaran, 0);

    if (format === 'csv') {
      const header = 'Bulan,Total Pemasukan,Total Pengeluaran,Selisih\n';
      const body = monthly
        .map((m: any) => `${m.bulan},${m.total_pemasukan},${m.total_pengeluaran},${m.selisih}`)
        .join('\n');
      const csv = header + body;
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="laporan-keuangan.csv"'
        }
      });
    }

    return json({
      monthly,
      summary: {
        total_pemasukan: grandTotalPemasukan,
        total_pengeluaran: grandTotalPengeluaran,
        selisiz: grandTotalPemasukan - grandTotalPengeluaran
      },
      period: { start, end }
    });
  } catch (e) {
    return json({error: String(e)}, {status: 500});
  }
}
