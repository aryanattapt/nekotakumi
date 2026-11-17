export type ProjectCategory = 'AI' | 'Product';
export type ProjectPreviewKind = 'research' | 'job-search' | 'pharmacy';

export interface LabProject {
	slug: string;
	number: string;
	name: string;
	category: ProjectCategory;
	categoryDetail: string;
	status: string;
	description: string;
	problem: string;
	approach: string;
	focusAreas: string[];
	githubUrl: string;
	updatedAt: string;
	preview: ProjectPreviewKind;
}

export const projects: LabProject[] = [
	{
		slug: 'takumi-research-agent',
		number: '01',
		name: 'Takumi Research Agent',
		category: 'AI',
		categoryDetail: 'AI · Research',
		status: 'In development',
		description: 'A research workflow that follows its sources and turns useful findings into article drafts in Indonesian and English.',
		problem: 'Sources get lost in research.',
		approach: 'Keep each claim tied to a source.',
		focusAreas: ['Source tracing', 'Evidence notes', 'Bilingual drafts'],
		githubUrl: 'https://github.com/aryanattapt/takumi-research-agent-v0',
		updatedAt: '2026-11-17',
		preview: 'research'
	},
	{
		slug: 'takumi-job-search-assistant',
		number: '02',
		name: 'Takumi Job Search Assistant',
		category: 'AI',
		categoryDetail: 'AI · Personal tools',
		status: 'In development',
		description: 'A personal workspace for researching roles, preparing applications, and keeping each next step in one place.',
		problem: 'Role notes scatter across apps.',
		approach: 'Put role prep in one workspace.',
		focusAreas: ['Role research', 'Company notes', 'Application prep'],
		githubUrl: 'https://github.com/aryanattapt/takumi-jobsearch-assistant',
		updatedAt: '2026-11-17',
		preview: 'job-search'
	},
	{
		slug: 'farmago',
		number: '03',
		name: 'FarmaGO',
		category: 'Product',
		categoryDetail: 'Product · Healthcare',
		status: 'MVP in development',
		description: 'An e-pharmacy MVP exploring product discovery, pharmacy selection, prescription review, and delivery.',
		problem: 'Orders need several handoffs.',
		approach: 'Map selection through delivery.',
		focusAreas: ['Pharmacy choice', 'Prescription review', 'Delivery flow'],
		githubUrl: 'https://github.com/aryanattapt/farmago',
		updatedAt: '2026-11-17',
		preview: 'pharmacy'
	}
];

export function getProject(slug: string): LabProject | undefined {
	return projects.find((project) => project.slug === slug);
}

export function formatProjectDate(value: string, locale = 'en-US'): string {
	return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
		.format(new Date(`${value}T00:00:00Z`));
}
