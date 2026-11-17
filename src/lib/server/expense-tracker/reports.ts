import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import sql from './db';

export interface MonthlyReportRow {
	bulan: string;
	total: number;
}

export interface MonthlyReportData {
	monthly: MonthlyReportRow[];
	summary: {
		total: number;
	};
	period: {
		start: string;
		end: string;
	};
}

const CURRENCY_FORMAT = '"IDR "#,##0;[Red]-"IDR "#,##0';

function formatCurrency(value: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'IDR',
		maximumFractionDigits: 0
	}).format(value);
}

function escapeCsvValue(value: string | number) {
	const text = String(value);
	return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function getReportFilename(start: string, end: string, extension: string) {
	const base = `expense-report-${start}-to-${end}`;
	return extension ? `${base}.${extension}` : base;
}

async function fetchMonthlyTotals(start: string, end: string): Promise<MonthlyReportRow[]> {
	const rows = await sql.unsafe<{ bulan: string; total: number }[]>(
		`
		SELECT
			to_char(t.tanggal, 'YYYY-MM') as bulan,
			COALESCE(SUM(t.jumlah), 0)::numeric as total
		FROM finansial.transaksi t
		WHERE t.tanggal >= $1::date
			AND t.tanggal <= $2::date
			AND (
				t.sumber NOT IN ('TOKOPEDIA', 'GRAB')
				OR NOT EXISTS (
					SELECT 1
					FROM finansial.transaksi j
					WHERE j.sumber = 'JENIUS'
						AND j.tanggal = t.tanggal
						AND j.jumlah = t.jumlah
				)
			)
		GROUP BY to_char(t.tanggal, 'YYYY-MM')
		ORDER BY bulan
		`,
		[start, end]
	);

	return rows.map((row) => ({
		bulan: row.bulan,
		total: Number(row.total || 0)
	}));
}

export async function getMonthlyReport(start: string, end: string): Promise<MonthlyReportData> {
	const monthly = await fetchMonthlyTotals(start, end);
	const total = monthly.reduce((sum, row) => sum + row.total, 0);

	return {
		monthly,
		summary: { total },
		period: { start, end }
	};
}

export function buildCsvReport(report: MonthlyReportData) {
	const header = 'Month,Total';
	const rows = report.monthly.map((row) => [escapeCsvValue(row.bulan), escapeCsvValue(row.total)].join(','));
	return [header, ...rows].join('\n');
}

export async function buildXlsxReport(report: MonthlyReportData) {
	const workbook = new ExcelJS.Workbook();
	workbook.creator = 'Nekotakumi';
	workbook.created = new Date();

	const sheet = workbook.addWorksheet('Expense report', {
		properties: { tabColor: { argb: '7C3AED' } }
	});

	sheet.columns = [
		{ key: 'bulan', width: 16 },
		{ key: 'total', width: 20 }
	];

	sheet.mergeCells('A1:B1');
	sheet.getCell('A1').value = 'Expense Tracker Report';
	sheet.getCell('A1').font = { bold: true, size: 16 };
	sheet.getCell('A1').alignment = { horizontal: 'center' };

	sheet.mergeCells('A2:B2');
	sheet.getCell('A2').value = `Period: ${report.period.start} to ${report.period.end}`;
	sheet.getCell('A2').alignment = { horizontal: 'center' };

	sheet.addRow([]);
	sheet.addRow(['Total expenses', report.summary.total]);
	sheet.addRow([]);
	sheet.addRow(['Month', 'Total']);

	const headerRow = sheet.getRow(6);
	headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
	headerRow.fill = {
		type: 'pattern',
		pattern: 'solid',
		fgColor: { argb: '7C3AED' }
	};
	headerRow.alignment = { horizontal: 'center' };

	sheet.addRows(report.monthly.map((row) => [row.bulan, row.total]));

	sheet.getRow(4).getCell(2).numFmt = CURRENCY_FORMAT;
	for (let rowNumber = 7; rowNumber <= sheet.rowCount; rowNumber += 1) {
		sheet.getRow(rowNumber).getCell(2).numFmt = CURRENCY_FORMAT;
	}

	sheet.getColumn(1).alignment = { horizontal: 'left' };
	sheet.getColumn(2).alignment = { horizontal: 'right' };

	sheet.autoFilter = {
		from: 'A6',
		to: `B${sheet.rowCount}`
	};

	sheet.eachRow((row) => {
		row.eachCell((cell) => {
			cell.border = {
				top: { style: 'thin', color: { argb: 'E5E7EB' } },
				left: { style: 'thin', color: { argb: 'E5E7EB' } },
				bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
				right: { style: 'thin', color: { argb: 'E5E7EB' } }
			};
		});
	});

	const buffer = await workbook.xlsx.writeBuffer();
	return Buffer.from(buffer);
}

export async function buildPdfReport(report: MonthlyReportData) {
	return await new Promise<Buffer>((resolve, reject) => {
		const chunks: Buffer[] = [];
		const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

		doc.on('data', (chunk: Buffer) => chunks.push(chunk));
		doc.on('error', reject);
		doc.on('end', () => resolve(Buffer.concat(chunks)));

		const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
		const columnWidths = [120, 100];
		const columnX = [doc.page.margins.left, doc.page.margins.left + columnWidths[0]];
		const rowHeight = 22;
		let y = doc.y;

		const drawTableHeader = () => {
			doc.fontSize(10).fillColor('#ffffff');
			doc.rect(doc.page.margins.left, y, pageWidth, rowHeight).fill('#2F7D4A');

			doc.fillColor('#ffffff').text('Month', columnX[0] + 6, y + 6, {
				width: columnWidths[0] - 12
			});
			doc.fillColor('#ffffff').text('Total', columnX[1] + 6, y + 6, {
				width: columnWidths[1] - 12,
				align: 'right'
			});

			y += rowHeight;
			doc.fillColor('#111827');
		};

		const ensureSpace = (neededHeight: number) => {
			if (y + neededHeight <= doc.page.height - doc.page.margins.bottom) return;
			doc.addPage();
			y = doc.y;
			drawTableHeader();
		};

		doc.fontSize(18).fillColor('#111827').text('Expense Tracker Report', {
			align: 'center'
		});
		doc.moveDown(0.3);
		doc.fontSize(10).fillColor('#4b5563').text(`Period: ${report.period.start} to ${report.period.end}`, {
			align: 'center'
		});
		doc.moveDown(1);

		doc.fontSize(11).fillColor('#111827').text(`Total expenses: ${formatCurrency(report.summary.total)}`);
		doc.moveDown(0.75);

		drawTableHeader();

		report.monthly.forEach((row, index) => {
			ensureSpace(rowHeight);
			const fill = index % 2 === 0 ? '#f9fafb' : '#ffffff';
			doc.rect(doc.page.margins.left, y, pageWidth, rowHeight).fillAndStroke(fill, '#e5e7eb');

			doc.fillColor('#111827').fontSize(9);
			doc.text(row.bulan, columnX[0] + 6, y + 6, { width: columnWidths[0] - 12 });
			doc.text(formatCurrency(row.total), columnX[1] + 6, y + 6, {
				width: columnWidths[1] - 12,
				align: 'right'
			});

			y += rowHeight;
		});

		doc.end();
	});
}
