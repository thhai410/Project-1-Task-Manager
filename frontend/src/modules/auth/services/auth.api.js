import api from '../../../shared/utils/http';

export async function loginApi(payload) {
  console.log('Calling login API with:', payload);
  const { data } = await api.post('/auth/login', payload);
  console.log('Login API response:', data);
  return data;
}

export async function registerApi(payload) {
  console.log('Calling register API with:', payload);
  const { data } = await api.post('/auth/register', payload);
  console.log('Register API response:', data);
  return data;
}

export async function meApi() {
  console.log('Calling me API');
  const { data } = await api.get('/auth/me');
  console.log('Me API response:', data);
  return data;
}

export async function logoutApi() {
  console.log('Calling logout API');
  const { data } = await api.post('/auth/logout');
  console.log('Logout API response:', data);
  return data;
}
