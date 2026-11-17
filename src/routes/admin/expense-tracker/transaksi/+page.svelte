<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import FilterBar from '$lib/components/expense-tracker/FilterBar.svelte';
	import DetailView from '$lib/components/expense-tracker/DetailView.svelte';

	let loading = $state(true);
	let transactions = $state<any[]>([]);
	let total = $state(0);
	let page = $state(1);
	let limit = $state(50);

	let startDate = $state('');
	let endDate = $state('');
	let sumber = $state('');

	function getToken(): string | null {
		if (browser) return localStorage.getItem('expense_token');
		return null;
	}

	async function fetchData(filters?: { start: string; end: string }, newPage?: number) {
		const token = getToken();
		if (!token) return;

		loading = true;
		const s = filters?.start || startDate;
		const e = filters?.end || endDate;
		const p = newPage || page;

		if (filters) {
			startDate = filters.start;
			endDate = filters.end;
		}

		try {
			let url = `/api/expense-tracker/detail?start=${s}&end=${e}&page=${p}&limit=${limit}`;
			if (sumber) url += `&sumber=${sumber}`;

			const res = await fetch(url, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (res.ok) {
				const data = await res.json();
				transactions = data.transactions || [];
				total = data.total || 0;
				page = data.page || 1;
			}
		} catch (e) {
			// silent
		} finally {
			loading = false;
		}
	}

	function handleApply(filters: { start: string; end: string }) {
		fetchData(filters);
	}

	function handlePageChange(newPage: number) {
		fetchData(undefined, newPage);
	}

	onMount(() => {
		const today = new Date();
		const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
		startDate = firstDay.toISOString().slice(0, 10);
		endDate = today.toISOString().slice(0, 10);
		fetchData();
	});
</script>

<div class="transaksi-page">
	<header class="page-heading">
		<p class="eyebrow">Expense tracker</p>
		<h2>Transaction details</h2>
		<p>Browse and filter transactions by date.</p>
	</header>
	<FilterBar {startDate} {endDate} onApply={handleApply} />

	{#if loading}
		<div class="loading">Loading data...</div>
	{:else}
		<DetailView
			{transactions}
			{total}
			{page}
			{limit}
			onPageChange={handlePageChange}
		/>
	{/if}
</div>

<style>
	.transaksi-page {
		/* container */
	}
	h2 {
		margin-bottom: 0.35rem;
		font-size: clamp(1.6rem, 3vw, 2rem);
	}
	.page-heading { margin-bottom: 1rem; }
	.page-heading p:last-child { color: var(--text-muted); }
	.eyebrow { color: var(--accent); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
	.loading {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted, #6b7280);
	}
</style>
