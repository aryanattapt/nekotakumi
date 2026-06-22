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

	let selMonth = $state(month);
	let selYear = $state(year);

	const months = [
		{ value: 1, label: 'Januari' },
		{ value: 2, label: 'Februari' },
		{ value: 3, label: 'Maret' },
		{ value: 4, label: 'April' },
		{ value: 5, label: 'Mei' },
		{ value: 6, label: 'Juni' },
		{ value: 7, label: 'Juli' },
		{ value: 8, label: 'Agustus' },
		{ value: 9, label: 'September' },
		{ value: 10, label: 'Oktober' },
		{ value: 11, label: 'November' },
		{ value: 12, label: 'Desember' },
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
		<label for="month">Bulan</label>
		<select id="month" bind:value={selMonth}>
			{#each months as m}
				<option value={m.value}>{m.label}</option>
			{/each}
		</select>
	</div>
	<div class="filter-group">
		<label for="year">Tahun</label>
		<input type="number" id="year" bind:value={selYear} min="2000" max="2100" />
	</div>
	<button class="btn" onclick={apply}>🔍 Terapkan</button>
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
