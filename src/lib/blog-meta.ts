const INDONESIAN_MARKERS = new Set([
	'adalah', 'akan', 'atau', 'bisa', 'dalam', 'dan', 'dari', 'dengan', 'ini', 'juga',
	'karena', 'kita', 'oleh', 'pada', 'saya', 'tidak', 'untuk', 'yang'
]);

const ENGLISH_MARKERS = new Set([
	'a', 'an', 'and', 'are', 'as', 'at', 'for', 'from', 'in', 'is', 'it', 'of', 'on',
	'that', 'the', 'this', 'to', 'was', 'were', 'with', 'you'
]);

function getWords(content: string | null | undefined) {
	return (content ?? '')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<[^>]*>/g, ' ')
		.match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function estimateReadingMinutes(content: string | null | undefined): number {
	const wordCount = getWords(content).length;
	return Math.max(1, Math.ceil(wordCount / 200));
}

export function detectLanguage(content: string | null | undefined): 'ID' | 'EN' {
	let indonesianScore = 0;
	let englishScore = 0;

	for (const word of getWords(content)) {
		const normalizedWord = word.toLowerCase();
		if (INDONESIAN_MARKERS.has(normalizedWord)) indonesianScore += 1;
		if (ENGLISH_MARKERS.has(normalizedWord)) englishScore += 1;
	}

	return indonesianScore > englishScore ? 'ID' : 'EN';
}
