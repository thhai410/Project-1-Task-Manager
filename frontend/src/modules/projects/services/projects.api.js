import api from '../../../shared/utils/http';

export async function getProjects(params = {}) {
	const { data } = await api.get('/project/get-prj', { params });
	return data;
}

export async function addProject(payload) {
	const { data } = await api.post('/project/add-prj', payload);
	return data;
}

export async function getProjectDetail(projectId) {
	const { data } = await api.get('/project/get-detail', { params: { projectId } });
	return data;
}

export async function updateProject(payload) {
	const { data } = await api.put('/project/update-prj', payload);
	return data;
}

export async function deleteProject(projectId) {
	const { data } = await api.delete('/project/delete-prj', { params: { project_id: projectId } });
	return data;
}

export async function addMemberToProject(projectId, payload) {
	const { data } = await api.post(`/project/add-member/${projectId}`, payload);
	return data;
}
