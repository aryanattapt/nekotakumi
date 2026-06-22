import { getDedupedSummary, getDedupedDetail, getTopExpenses, getDailySummary, getMonthlySummary, getYearlySummary } from './dedup';
import type { SourceSummary, TransaksiRow } from './dedup';

export interface SummaryResult {
	sources: SourceSummary[];
	grand_total: number;
	period: { start: string; end: string };
}

export interface DailySummaryResult {
	daily: { date: string; total: number; sources: SourceSummary[] }[];
	grand_total: number;
	period: { start: string; end: string };
}

export interface MonthlySummaryResult {
	monthly: { month: string; total: number; sources: SourceSummary[] }[];
	grand_total: number;
	period: { start: string; end: string };
}

export interface YearlySummaryResult {
	yearly: { year: string; total: number; sources: SourceSummary[] }[];
	grand_total: number;
	period: { start: string; end: string };
}

export interface DetailResult {
	transactions: TransaksiRow[];
	total: number;
	page: number;
	limit: number;
}

export interface TopExpensesResult {
	top_expenses: { deskripsi: string | null; jumlah: number; sumber: string }[];
	period: { start: string; end: string };
}

export async function getSummary(
	start: string,
	end: string,
	groupBy?: 'daily' | 'monthly' | 'yearly'
): Promise<SummaryResult | DailySummaryResult | MonthlySummaryResult | YearlySummaryResult> {
	const period = { start, end };

	if (groupBy === 'daily') {
		const daily = await getDailySummary(start, end);
		const grand_total = daily.reduce((sum, d) => sum + d.total, 0);
		return { daily, grand_total, period };
	}

	if (groupBy === 'monthly') {
		const monthly = await getMonthlySummary(start, end);
		const grand_total = monthly.reduce((sum, m) => sum + m.total, 0);
		return { monthly, grand_total, period };
	}

	if (groupBy === 'yearly') {
		const yearly = await getYearlySummary(start, end);
		const grand_total = yearly.reduce((sum, y) => sum + y.total, 0);
		return { yearly, grand_total, period };
	}

	const sources = await getDedupedSummary(start, end);
	const grand_total = sources.reduce((sum, s) => sum + s.total, 0);
	return { sources, grand_total, period };
}

export async function getDetail(
	start: string,
	end: string,
	sumber?: string,
	page: number = 1,
	limit: number = 50
): Promise<DetailResult> {
	const result = await getDedupedDetail(start, end, sumber, page, limit);
	return {
		transactions: result.rows,
		total: result.total,
		page,
		limit
	};
}

export async function getTopExpensesData(
	start: string,
	end: string,
	limit: number = 10
): Promise<TopExpensesResult> {
	const top_expenses = await getTopExpenses(start, end, limit);
	return {
		top_expenses,
		period: { start, end }
	};
}
