import api from '../../../shared/utils/http';

export async function getTasks(params = {}) {
	const { data } = await api.get('/task/get-tasks', { params });
	return data;
}

export async function addTask(payload) {
	const { data } = await api.post('/task/add-task', payload);
	return data;
}

export async function updateTask(id, payload) {
	const { data } = await api.put(`/task/update-task/${id}`, payload);
	return data;
}

export async function deleteTask(id) {
	const { data } = await api.delete('/task/delete-task', { params: { task_id: id } });
	return data;
}
