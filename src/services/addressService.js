import { appConfig } from '../config';
import {
  deleteAddress,
  loadAddressesByUserId,
  replaceAddressesByUserId,
  saveAddress,
  setDefaultAddress,
} from '../utils/addressStorage';
import { loadSessionToken } from '../utils/authStorage';

import { requestJson } from './http';

const toAsyncResult = (callback) => Promise.resolve().then(callback);

const normalizeAddressResponse = (userId, payload) => {
  const addresses = Array.isArray(payload) ? payload : [payload];

  return addresses
    .filter(Boolean)
    .map((address) => saveAddress({ ...address, userId }))
    .filter(Boolean);
};

const replaceAddressesResponse = (userId, payload) => {
  const addresses = Array.isArray(payload) ? payload : [payload];

  return replaceAddressesByUserId(
    userId,
    addresses.filter(Boolean).map((address) => ({ ...address, userId }))
  );
};

function getAddressesByUserId(userId) {
  return loadAddressesByUserId(userId);
}

function getAddressById(userId, addressId) {
  return (
    getAddressesByUserId(userId).find((address) => address.id === String(addressId ?? '')) ?? null
  );
}

function saveUserAddress(userId, address) {
  return saveAddress({ ...address, userId });
}

function deleteUserAddress(userId, addressId) {
  deleteAddress(userId, addressId);
  return getAddressesByUserId(userId);
}

function setUserDefaultAddress(userId, addressId) {
  return setDefaultAddress(userId, addressId);
}

function getAddressesByUserIdAsync(userId) {
  if (!appConfig.useRemoteApi) {
    return toAsyncResult(() => getAddressesByUserId(userId));
  }

  return requestJson('/users/me/addresses', {
    method: 'GET',
    token: loadSessionToken(),
  }).then((response) => replaceAddressesResponse(userId, response));
}

function saveUserAddressAsync(userId, address) {
  if (!appConfig.useRemoteApi) {
    return toAsyncResult(() => saveUserAddress(userId, address));
  }

  const normalizedId = String(address?.id ?? '').trim();

  return requestJson(normalizedId ? `/users/me/addresses/${normalizedId}` : '/users/me/addresses', {
    method: normalizedId ? 'PUT' : 'POST',
    token: loadSessionToken(),
    body: {
      type: address?.type,
      line1: address?.line1,
      line2: address?.line2,
      city: address?.city,
      state: address?.state,
      country: address?.country,
      postalCode: address?.postalCode,
      isDefault: Boolean(address?.isDefault),
    },
  }).then((response) => normalizeAddressResponse(userId, response)[0] ?? null);
}

function deleteUserAddressAsync(userId, addressId) {
  if (!appConfig.useRemoteApi) {
    return toAsyncResult(() => deleteUserAddress(userId, addressId));
  }

  return requestJson(`/users/me/addresses/${addressId}`, {
    method: 'DELETE',
    token: loadSessionToken(),
  }).then(() => deleteUserAddress(userId, addressId));
}

function setUserDefaultAddressAsync(userId, addressId) {
  if (!appConfig.useRemoteApi) {
    return toAsyncResult(() => setUserDefaultAddress(userId, addressId));
  }

  return requestJson(`/users/me/addresses/${addressId}/default`, {
    method: 'PATCH',
    token: loadSessionToken(),
  }).then((response) => normalizeAddressResponse(userId, response));
}

const addressService = {
  deleteUserAddress,
  deleteUserAddressAsync,
  getAddressById,
  getAddressesByUserId,
  getAddressesByUserIdAsync,
  saveUserAddress,
  saveUserAddressAsync,
  setUserDefaultAddress,
  setUserDefaultAddressAsync,
};

export { addressService };
export default addressService;
