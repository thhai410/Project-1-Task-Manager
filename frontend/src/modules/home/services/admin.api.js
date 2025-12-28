import api from '../../../shared/utils/http';

export async function getAdminStatsApi() {
  console.log('Calling admin stats API');
  const { data } = await api.get('/admin/stats');
  console.log('Admin stats API response:', data);
  return data;
}

export async function getAllUsersApi() {
  const { data } = await api.get('/admin/users');
  return data;
}

export async function getAllProjectsApi() {
  const { data } = await api.get('/admin/projects');
  return data;
}

export async function getAllTasksApi() {
  const { data } = await api.get('/admin/tasks');
  return data;
}

export async function getAllLogsApi() {
  const { data } = await api.get('/admin/logs');
  return data;
}