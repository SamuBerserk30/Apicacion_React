import { loadSessionToken } from '../utils/authStorage';

const getAuthHeader = () => {
  const token = loadSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const callApi = async (path, options = {}) => {
  const response = await fetch(`/api/v1${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...getAuthHeader(), ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? `Error ${response.status}`);
  return data;
};

export async function createAddress({ line1, city, state = 'Antioquia', country = 'Colombia', postalCode, type = 'SHIPPING', isDefault = true }) {
  return callApi('/users/me/addresses', {
    method: 'POST',
    body: { type, line1, line2: '', city, state, country, postalCode, isDefault },
  });
}

export async function listAddresses() {
  return callApi('/users/me/addresses', { method: 'GET' });
}

const addressService = { createAddress, listAddresses };
export default addressService;