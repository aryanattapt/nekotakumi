<script lang="ts">
	export type ArrowDirection = 'up-right' | 'down-right' | 'left' | 'right' | 'up';

	const paths: Record<ArrowDirection, string> = {
		'up-right': 'M4 12 12 4M5 4h7v7',
		'down-right': 'M4 4 12 12M5 12h7V5',
		left: 'M12 8H4m0 0 4-4m-4 4 4 4',
		right: 'M4 8h8m0 0L8 4m4 4-4 4',
		up: 'M8 12V4m0 0L4 8m4-4 4 4'
	};

	let { direction = 'up-right', size = 16 }: { direction?: ArrowDirection; size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
	<path d={paths[direction]} />
</svg>

<style>
	svg { display: block; flex: 0 0 auto; overflow: visible; }
	path { fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
</style>
