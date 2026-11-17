<script lang="ts">
	let {
		month = new Date().getMonth() + 1,
		year = new Date().getFullYear(),
		onApply
	}: {
		month?: number;
		year?: number;
		onApply: (filters: { month: number; year: number }) => void;
	} = $props();

	let selMonth = $state(new Date().getMonth() + 1);
	let selYear = $state(new Date().getFullYear());

	const months = [
		{ value: 1, label: 'January' },
		{ value: 2, label: 'February' },
		{ value: 3, label: 'March' },
		{ value: 4, label: 'April' },
		{ value: 5, label: 'May' },
		{ value: 6, label: 'June' },
		{ value: 7, label: 'July' },
		{ value: 8, label: 'August' },
		{ value: 9, label: 'September' },
		{ value: 10, label: 'October' },
		{ value: 11, label: 'November' },
		{ value: 12, label: 'December' },
	];

	$effect(() => {
		selMonth = month;
		selYear = year;
	});

	function apply() {
		onApply({ month: selMonth, year: selYear });
	}
</script>

<div class="filter-bar">
	<div class="filter-group">
		<label for="month">Month</label>
		<select id="month" bind:value={selMonth}>
			{#each months as m}
				<option value={m.value}>{m.label}</option>
			{/each}
		</select>
	</div>
	<div class="filter-group">
		<label for="year">Year</label>
		<input type="number" id="year" bind:value={selYear} min="2000" max="2100" />
	</div>
	<button class="btn" onclick={apply}>🔍 Apply</button>
</div>

<style>
	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: flex-end;
		padding: 1rem;
		background: var(--bg-card, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: var(--radius, 12px);
		margin-bottom: 1rem;
	}
	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.filter-group label {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--text-muted, #6b7280);
	}
	.filter-group select,
	.filter-group input {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 8px;
		font-size: 0.9rem;
		background: var(--bg, #fafafa);
	}
	.btn {
		padding: 0.5rem 1rem;
		background: var(--accent, #7c3aed);
		color: #fff;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		font-size: 0.9rem;
		white-space: nowrap;
	}
	.btn:hover {
		background: var(--accent-hover, #6d28d9);
	}
</style>
