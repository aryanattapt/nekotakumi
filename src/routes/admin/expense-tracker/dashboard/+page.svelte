<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import MonthYearFilter from '$lib/components/expense-tracker/MonthYearFilter.svelte';
	import SummaryView from '$lib/components/expense-tracker/SummaryView.svelte';
	import TopExpensesChart from '$lib/components/expense-tracker/TopExpensesChart.svelte';

	let loading = $state(true);
	let error = $state('');

	// Summary data
	let sources = $state<{ sumber: string; count: number; total: number }[]>([]);
	let grandTotal = $state(0);

	// Top expenses
	let topExpenses = $state<{ deskripsi: string | null; jumlah: number; sumber: string }[]>([]);

	// Filters
	let month = $state(new Date().getMonth() + 1);
	let year = $state(new Date().getFullYear());

	function getToken(): string | null {
		if (browser) return localStorage.getItem('expense_token');
		return null;
	}

	function getDateRange(m: number, y: number): { start: string; end: string } {
		const start = `${y}-${String(m).padStart(2, '0')}-01`;
		// Last day of month
		const lastDay = new Date(y, m, 0).getDate();
		const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
		return { start, end };
	}

	async function fetchData(filters?: { month: number; year: number }) {
		const token = getToken();
		if (!token) return;

		loading = true;
		error = '';

		const m = filters?.month || month;
		const y = filters?.year || year;
		if (filters) {
			month = filters.month;
			year = filters.year;
		}

		const { start, end } = getDateRange(m, y);

		try {
			const summaryUrl = `/api/expense-tracker/summary?start=${start}&end=${end}`;

			const [summaryRes, topRes] = await Promise.all([
				fetch(summaryUrl, { headers: { 'Authorization': `Bearer ${token}` } }),
				fetch(`/api/expense-tracker/top-expenses?start=${start}&end=${end}&limit=10`, {
					headers: { 'Authorization': `Bearer ${token}` }
				})
			]);

			if (!summaryRes.ok) throw new Error('Could not load data');
			const summaryData = await summaryRes.json();

			if (summaryData.sources) {
				sources = summaryData.sources;
				grandTotal = summaryData.grand_total;
			} else if (summaryData.daily) {
				const allSources: Map<string, { sumber: string; count: number; total: number }> = new Map();
				let total = 0;
				for (const day of summaryData.daily) {
					total += day.total;
					for (const src of day.sources) {
						if (allSources.has(src.sumber)) {
							const existing = allSources.get(src.sumber)!;
							existing.count += src.count;
							existing.total += src.total;
						} else {
							allSources.set(src.sumber, { ...src });
						}
					}
				}
				sources = Array.from(allSources.values());
				grandTotal = total;
			} else if (summaryData.monthly) {
				const allSources: Map<string, { sumber: string; count: number; total: number }> = new Map();
				let total = 0;
				for (const m of summaryData.monthly) {
					total += m.total;
					for (const src of m.sources) {
						if (allSources.has(src.sumber)) {
							const existing = allSources.get(src.sumber)!;
							existing.count += src.count;
							existing.total += src.total;
						} else {
							allSources.set(src.sumber, { ...src });
						}
					}
				}
				sources = Array.from(allSources.values());
				grandTotal = total;
			} else if (summaryData.yearly) {
				const allSources: Map<string, { sumber: string; count: number; total: number }> = new Map();
				let total = 0;
				for (const y of summaryData.yearly) {
					total += y.total;
					for (const src of y.sources) {
						if (allSources.has(src.sumber)) {
							const existing = allSources.get(src.sumber)!;
							existing.count += src.count;
							existing.total += src.total;
						} else {
							allSources.set(src.sumber, { ...src });
						}
					}
				}
				sources = Array.from(allSources.values());
				grandTotal = total;
			}

			// Top expenses
			if (topRes.ok) {
				const topData = await topRes.json();
				topExpenses = topData.top_expenses || [];
			}

		} catch (e: any) {
			error = e.message || 'Could not load data';
		} finally {
			loading = false;
		}
	}

	function handleApply(filters: { month: number; year: number }) {
		fetchData(filters);
	}

	onMount(() => {
		fetchData();
	});
</script>

<div class="dashboard">
	<header class="page-heading">
		<p class="eyebrow">Expense tracker</p>
		<h2>Monthly overview</h2>
		<p>A quick read on where this month’s spending is going.</p>
	</header>
	<MonthYearFilter {month} {year} onApply={handleApply} />

	{#if loading}
		<div class="loading">Loading data...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else}
		<SummaryView {sources} grandTotal={grandTotal} />
		<TopExpensesChart expenses={topExpenses} />
	{/if}
</div>

<style>
	.dashboard {
		/* container */
	}
	.page-heading { margin-bottom: 1rem; }
	.page-heading h2 { margin-bottom: 0.35rem; font-size: clamp(1.6rem, 3vw, 2rem); }
	.page-heading p:last-child { color: var(--text-muted); }
	.eyebrow { color: var(--accent); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
	.loading, .error {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted, #6b7280);
	}
	.error {
		color: #ef4444;
	}
</style>
