import api from '../../../shared/utils/http';

export async function getDashboardStats() {
  const { data } = await api.get('/dashboard/get-dashboard');
  return data;
}