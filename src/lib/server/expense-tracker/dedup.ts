import sql from './db';

export interface TransaksiRow {
	id: number;
	tanggal: string;
	sumber: string;
	jenis: string | null;
	deskripsi: string | null;
	jumlah: number;
	via_jenius: boolean;
}

export interface SourceSummary {
	sumber: string;
	count: number;
	total: number;
}

/**
 * Get deduped summary per sumber.
 * TOKOPEDIA & GRAB excluded if matching JENIUS on same tanggal + jumlah.
 */
export async function getDedupedSummary(start?: string, end?: string): Promise<SourceSummary[]> {
	const rows: SourceSummary[] = [];

	// All sources except TOKOPEDIA & GRAB
	let where = '';
	const params: (string | undefined)[] = [];
	if (start && end) {
		where = 'WHERE t.tanggal >= $1 AND t.tanggal <= $2 AND t.sumber NOT IN ($3, $4)';
		params.push(start, end, 'TOKOPEDIA', 'GRAB');
	} else {
		where = "WHERE t.sumber NOT IN ('TOKOPEDIA', 'GRAB')";
	}

	const mainRows = await sql.unsafe<{ sumber: string; count: number; total: number }[]>(
		`SELECT t.sumber, COUNT(*)::int as count, COALESCE(SUM(t.jumlah), 0)::numeric as total
		FROM finansial.transaksi t
		${where}
		GROUP BY t.sumber ORDER BY t.sumber`,
		params
	);
	for (const r of mainRows) {
		rows.push({ sumber: r.sumber, count: r.count, total: Number(r.total) });
	}

	// TOKOPEDIA & GRAB amounts that DON'T have matching JENIUS on same date
	for (const sumber of ['TOKOPEDIA', 'GRAB']) {
		let tokpedWhere: string;
		const tokpedParams: (string | undefined)[] = [];
		if (start && end) {
			tokpedWhere = 'WHERE t.tanggal >= $1 AND t.tanggal <= $2 AND t.sumber = $3';
			tokpedParams.push(start, end, sumber);
		} else {
			tokpedWhere = `WHERE t.sumber = '${sumber}'`;
		}

		const result = await sql.unsafe<{ count: number; total: number }[]>(
			`SELECT COUNT(*)::int as count, COALESCE(SUM(t.jumlah), 0)::numeric as total
			FROM finansial.transaksi t
			${tokpedWhere}
			AND NOT EXISTS (
				SELECT 1 FROM finansial.transaksi j
				WHERE j.sumber = 'JENIUS'
				AND j.tanggal = t.tanggal
				AND j.jumlah = t.jumlah
			)`,
			tokpedParams
		);
		if (result.length > 0 && result[0].count > 0) {
			rows.push({ sumber, count: result[0].count, total: Number(result[0].total) });
		}
	}

	return rows;
}

/**
 * Get deduped detail rows.
 * TOKOPEDIA/GRAB matched to JENIUS marked as via_jenius=true.
 */
export async function getDedupedDetail(
	start?: string,
	end?: string,
	sumber?: string,
	page: number = 1,
	limit: number = 50
): Promise<{ rows: TransaksiRow[]; total: number }> {
	const conditions: string[] = [];
	const params: (string | number)[] = [];
	let paramIdx = 1;

	if (start && end) {
		conditions.push(`t.tanggal >= $${paramIdx++} AND t.tanggal <= $${paramIdx++}`);
		params.push(start, end);
	}
	if (sumber) {
		conditions.push(`t.sumber = $${paramIdx++}`);
		params.push(sumber);
	}

	const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

	// Count total
	const countResult = await sql.unsafe<{ total: number }[]>(
		`SELECT COUNT(*)::int as total FROM finansial.transaksi t ${where}`,
		params
	);
	const total = countResult.length > 0 ? countResult[0].total : 0;

	// Get paginated rows
	const offset = (page - 1) * limit;
	const dataParams = [...params, limit, offset];
	const dataIdx = paramIdx;

	const data = await sql.unsafe<TransaksiRow[]>(
		`SELECT t.id, t.tanggal::text, t.sumber, t.jenis, t.deskripsi, t.jumlah::numeric,
			CASE WHEN t.sumber IN ('TOKOPEDIA','GRAB') AND EXISTS (
				SELECT 1 FROM finansial.transaksi j
				WHERE j.sumber = 'JENIUS'
				AND j.tanggal = t.tanggal
				AND j.jumlah = t.jumlah
			) THEN true ELSE false END as via_jenius
		FROM finansial.transaksi t
		${where}
		ORDER BY t.tanggal DESC, t.sumber
		LIMIT $${dataIdx} OFFSET $${dataIdx + 1}`,
		dataParams
	);

	return {
		rows: data.map(r => ({ ...r, jumlah: Number(r.jumlah) })),
		total
	};
}

/**
 * Get top N expenses by amount.
 */
export async function getTopExpenses(
	start?: string,
	end?: string,
	limit: number = 10
): Promise<{ deskripsi: string | null; jumlah: number; sumber: string }[]> {
	const conditions: string[] = [];
	const params: (string | number)[] = [];
	let paramIdx = 1;

	if (start && end) {
		conditions.push(`t.tanggal >= $${paramIdx++} AND t.tanggal <= $${paramIdx++}`);
		params.push(start, end);
	}

	const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

	const data = await sql.unsafe<{ deskripsi: string | null; jumlah: number; sumber: string }[]>(
		`SELECT t.deskripsi, t.jumlah::numeric, t.sumber
		FROM finansial.transaksi t
		${where}
		ORDER BY t.jumlah DESC
		LIMIT $${paramIdx}`,
		[...params, limit]
	);

	return data.map(r => ({ ...r, jumlah: Number(r.jumlah) }));
}

/**
 * Get daily grouped summary.
 */
export async function getDailySummary(
	start?: string,
	end?: string
): Promise<{ date: string; total: number; sources: SourceSummary[] }[]> {
	const conditions: string[] = [];
	const params: (string)[] = [];
	let paramIdx = 1;

	if (start && end) {
		conditions.push(`t.tanggal >= $${paramIdx++} AND t.tanggal <= $${paramIdx++}`);
		params.push(start, end);
	}

	const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

	const data = await sql.unsafe<{ date: string; sumber: string; count: number; total: number }[]>(
		`SELECT t.tanggal::text as date, t.sumber, COUNT(*)::int as count, COALESCE(SUM(t.jumlah), 0)::numeric as total
		FROM finansial.transaksi t
		${where}
		AND t.sumber NOT IN ('TOKOPEDIA', 'GRAB')
		GROUP BY t.tanggal, t.sumber
		ORDER BY t.tanggal, t.sumber`,
		params
	);

	// Group by date
	const dateMap = new Map<string, { total: number; sources: SourceSummary[] }>();
	for (const r of data) {
		if (!dateMap.has(r.date)) {
			dateMap.set(r.date, { total: 0, sources: [] });
		}
		const entry = dateMap.get(r.date)!;
		entry.sources.push({ sumber: r.sumber, count: r.count, total: Number(r.total) });
		entry.total += Number(r.total);
	}

	return Array.from(dateMap.entries()).map(([date, val]) => ({
		date,
		...val
	}));
}

/**
 * Get monthly grouped summary.
 */
export async function getMonthlySummary(
	start?: string,
	end?: string
): Promise<{ month: string; total: number; sources: SourceSummary[] }[]> {
	const conditions: string[] = [];
	const params: (string)[] = [];
	let paramIdx = 1;

	if (start && end) {
		conditions.push(`t.tanggal >= $${paramIdx++} AND t.tanggal <= $${paramIdx++}`);
		params.push(start, end);
	}

	const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

	const data = await sql.unsafe<{ month: string; sumber: string; count: number; total: number }[]>(
		`SELECT TO_CHAR(t.tanggal, 'YYYY-MM') as month, t.sumber, COUNT(*)::int as count, COALESCE(SUM(t.jumlah), 0)::numeric as total
		FROM finansial.transaksi t
		${where}
		AND t.sumber NOT IN ('TOKOPEDIA', 'GRAB')
		GROUP BY TO_CHAR(t.tanggal, 'YYYY-MM'), t.sumber
		ORDER BY month, t.sumber`,
		params
	);

	const monthMap = new Map<string, { total: number; sources: SourceSummary[] }>();
	for (const r of data) {
		if (!monthMap.has(r.month)) {
			monthMap.set(r.month, { total: 0, sources: [] });
		}
		const entry = monthMap.get(r.month)!;
		entry.sources.push({ sumber: r.sumber, count: r.count, total: Number(r.total) });
		entry.total += Number(r.total);
	}

	return Array.from(monthMap.entries()).map(([month, val]) => ({
		month,
		...val
	}));
}

/**
 * Get yearly grouped summary.
 */
export async function getYearlySummary(
	start?: string,
	end?: string
): Promise<{ year: string; total: number; sources: SourceSummary[] }[]> {
	const conditions: string[] = [];
	const params: (string)[] = [];
	let paramIdx = 1;

	if (start && end) {
		conditions.push(`t.tanggal >= $${paramIdx++} AND t.tanggal <= $${paramIdx++}`);
		params.push(start, end);
	}

	const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

	const data = await sql.unsafe<{ year: string; sumber: string; count: number; total: number }[]>(
		`SELECT TO_CHAR(t.tanggal, 'YYYY') as year, t.sumber, COUNT(*)::int as count, COALESCE(SUM(t.jumlah), 0)::numeric as total
		FROM finansial.transaksi t
		${where}
		AND t.sumber NOT IN ('TOKOPEDIA', 'GRAB')
		GROUP BY TO_CHAR(t.tanggal, 'YYYY'), t.sumber
		ORDER BY year, t.sumber`,
		params
	);

	const yearMap = new Map<string, { total: number; sources: SourceSummary[] }>();
	for (const r of data) {
		if (!yearMap.has(r.year)) {
			yearMap.set(r.year, { total: 0, sources: [] });
		}
		const entry = yearMap.get(r.year)!;
		entry.sources.push({ sumber: r.sumber, count: r.count, total: Number(r.total) });
		entry.total += Number(r.total);
	}

	return Array.from(yearMap.entries()).map(([year, val]) => ({
		year,
		...val
	}));
}
