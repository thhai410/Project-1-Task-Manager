import api from '../../../shared/utils/http';

export async function getLogs(params = {}) {
  const { data } = await api.get('/log/get-log', { params });
  return data;
}

export async function addLog(payload) {
  const { data } = await api.post('/log/add-log', payload);
  return data;
}

export async function updateLog(payload) {
  // Backend expect logId in body, not in URL
  const { data } = await api.put('/log/update-log', payload);
  return data;
}

export async function deleteLog(id) {
  const { data } = await api.delete('/log/delete-log', { params: { log_id: id } });
  return data;
}
