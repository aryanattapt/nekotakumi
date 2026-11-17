import { error } from '@sveltejs/kit';
import { getProject } from '$lib/projects';

export function load({ params }) {
	const project = getProject(params.slug);

	if (!project) {
		error(404, 'Experiment not found');
	}

	return { project };
}
