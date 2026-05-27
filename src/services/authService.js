import { appConfig } from '../config';
import {
  clearSessionToken,
  clearSessionUser,
  createUser,
  findUserByEmail,
  loadSessionToken,
  loadSessionUser,
  loadUsers,
  saveSessionToken,
  saveSessionUser,
  updateUser,
} from '../utils/authStorage';
import { saveCart } from '../utils/cartStorage';

import cartService from './cartService';
import { requestJson } from './http';

const MIN_REGISTER_PASSWORD_LENGTH = 6;
const MIN_CHANGE_PASSWORD_LENGTH = 8;

const normalizeStatus = (status) => {
  const s = String(status ?? '').trim().toUpperCase();
  return s === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
};

const normalizeRole = (role) => {
  const r = String(role ?? '').trim().toUpperCase();
  return r === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
};

const getFullName = (firstName, lastName, fallback = '') => {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return fullName || String(fallback ?? '').trim();
};

const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();

const toSessionUser = (user) => {
  if (!user) return null;
  const firstName = String(user.firstName ?? '').trim();
  const lastName = String(user.lastName ?? '').trim();
  const fullName = getFullName(firstName, lastName, user.fullName ?? user.name);

  return {
    id: user.id,
    firstName,
    lastName,
    fullName,
    name: fullName,
    email: user.email,
    role: normalizeRole(user.role),
    phone: String(user.phone ?? '').trim(),
    status: String(user.status ?? 'ACTIVE').trim() || 'ACTIVE',
    createdAt: String(user.createdAt ?? ''),
  };
};

const getErrorMessage = (error, fallback) =>
  error instanceof Error && error.message ? error.message : fallback;

const normalizeAuthResponse = (payload) => {
  const sessionUser = toSessionUser(payload?.user ?? payload);
  if (!sessionUser) {
    return { ok: false, error: 'La respuesta de autenticación no contiene un usuario válido.' };
  }

  saveSessionUser(sessionUser);
  saveSessionToken(payload?.sessionToken ?? payload?.token);

  if (payload && Object.prototype.hasOwnProperty.call(payload, 'cart') && payload.cart) {
    saveCart(payload.cart);
  }

  return {
    ok: true,
    user: sessionUser,
    token: String(payload?.sessionToken ?? payload?.token ?? ''),
    sessionId: String(payload?.sessionId ?? ''),
    expiresAt: String(payload?.expiresAt ?? ''),
    cart: payload?.cart ?? null,
  };
};

const buildRemoteAuthPayload = (payload) => {
  const guestCartId = String(payload?.guestCartId ?? '').trim();
  const phone = String(payload?.phone ?? '').trim();
  return {
    ...payload,
    ...(phone ? { phone } : {}),
    ...(guestCartId ? { guestCartId } : {}),
  };
};

const syncRemoteCartAfterAuth = async (result, payload = {}) => {
  if (!appConfig.useRemoteApi || !result?.ok) return result;
  if (result.cart) return result;

  const guestCartId = String(payload?.guestCartId ?? '').trim();
  try {
    const cart = guestCartId
      ? await cartService.mergeCartAsync(guestCartId)
      : await cartService.getCartAsync();
    return { ...result, cart };
  } catch {
    return result;
  }
};

function registerLocal({ firstName, lastName, name, email, password, phone }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedFirstName = String(firstName ?? name ?? '').trim();
  const normalizedLastName = String(lastName ?? '').trim();

  if (!normalizedFirstName) return { ok: false, error: 'Ingresa el nombre para crear la cuenta.' };
  if (!normalizedEmail) return { ok: false, error: 'Ingresa un correo electrónico válido.' };
  if (!password || password.length < MIN_REGISTER_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `La contraseña debe tener al menos ${MIN_REGISTER_PASSWORD_LENGTH} caracteres.`,
    };
  }
  if (findUserByEmail(normalizedEmail)) {
    return { ok: false, error: 'Ya existe una cuenta registrada con ese correo.' };
  }

  const user = createUser({
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    email: normalizedEmail,
    password,
    phone,
  });
  saveSessionUser(user);
  return { ok: true, user };
}

function loginLocal({ email, password }) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return { ok: false, error: 'Credenciales inválidas. Verifica correo y contraseña.' };
  }
  const sessionUser = toSessionUser(user);
  saveSessionUser(sessionUser);
  return { ok: true, user: sessionUser };
}

async function register(payload) {
  if (!appConfig.useRemoteApi) return registerLocal(payload);

  try {
    const response = await requestJson('/auth/register', {
      method: 'POST',
      body: buildRemoteAuthPayload(payload),
    });
    return await syncRemoteCartAfterAuth(normalizeAuthResponse(response), payload);
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error, 'No fue posible registrar la cuenta en este momento.'),
    };
  }
}

async function login(payload) {
  if (!appConfig.useRemoteApi) return loginLocal(payload);

  try {
    const response = await requestJson('/auth/login', {
      method: 'POST',
      body: buildRemoteAuthPayload(payload),
    });
    return await syncRemoteCartAfterAuth(normalizeAuthResponse(response), payload);
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error, 'No fue posible iniciar sesión en este momento.'),
    };
  }
}

async function hydrateSession() {
  const sessionUser = loadSessionUser();
  if (!appConfig.useRemoteApi) return { ok: true, user: sessionUser };

  const token = loadSessionToken();
  if (!token) return { ok: true, user: null };

  try {
    const response = await requestJson('/auth/me', { method: 'GET', token });
    return await syncRemoteCartAfterAuth(normalizeAuthResponse({ user: response, token }));
  } catch (error) {
    clearSessionUser();
    clearSessionToken();
    return {
      ok: false,
      user: null,
      error: getErrorMessage(error, 'No fue posible restaurar la sesión actual.'),
    };
  }
}

async function logout() {
  if (appConfig.useRemoteApi) {
    try {
      const token = loadSessionToken();
      if (token) {
        await requestJson('/auth/logout', { method: 'POST', token });
      }
    } catch {
      // Limpiamos sesión local aunque falle el logout remoto
    }
  }
  clearSessionUser();
  clearSessionToken();
  return { ok: true };
}

function getSessionUser() {
  return loadSessionUser();
}

async function updateProfile(userId, updates) {
  const normalizedUserId = String(userId ?? '').trim();
  if (!normalizedUserId) {
    return { ok: false, error: 'No existe una sesión válida para actualizar el perfil.' };
  }

  const profileUpdates = {
    firstName: String(updates?.firstName ?? updates?.name ?? '').trim(),
    lastName: String(updates?.lastName ?? '').trim(),
    phone: String(updates?.phone ?? '').trim(),
  };

  if (!profileUpdates.firstName) {
    return { ok: false, error: 'El nombre es obligatorio para actualizar el perfil.' };
  }

  if (!appConfig.useRemoteApi) {
    const updatedUser = updateUser(normalizedUserId, profileUpdates);
    if (!updatedUser) return { ok: false, error: 'No fue posible actualizar el perfil actual.' };
    return { ok: true, user: updatedUser };
  }

  try {
    const token = loadSessionToken();
    const response = await requestJson('/users/me', {
      method: 'PUT',
      body: profileUpdates,
      token,
    });
    const normalizedResponse = response?.user
      ? normalizeAuthResponse({ ...response, token: response.token ?? token })
      : normalizeAuthResponse({ user: response, token });
    if (!normalizedResponse.ok) return normalizedResponse;
    return { ok: true, user: normalizedResponse.user };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error, 'No fue posible actualizar el perfil en este momento.'),
    };
  }
}

async function changePassword(userId, currentPassword, newPassword) {
  const normalizedUserId = String(userId ?? '').trim();
  if (!normalizedUserId) {
    return { ok: false, error: 'No existe una sesión válida para cambiar la contraseña.' };
  }
  if (!currentPassword) return { ok: false, error: 'Debes ingresar la contraseña actual.' };
  if (!newPassword || newPassword.length < MIN_CHANGE_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `La nueva contraseña debe tener al menos ${MIN_CHANGE_PASSWORD_LENGTH} caracteres.`,
    };
  }
  if (currentPassword === newPassword) {
    return { ok: false, error: 'La nueva contraseña debe ser diferente a la actual.' };
  }

  if (!appConfig.useRemoteApi) {
    const user = loadUsers().find((u) => u.id === normalizedUserId) ?? null;
    if (!user || user.password !== currentPassword) {
      return { ok: false, error: 'La contraseña actual es incorrecta.' };
    }
    const updatedUser = updateUser(normalizedUserId, { password: newPassword });
    if (!updatedUser) return { ok: false, error: 'No fue posible actualizar la contraseña.' };
    return { ok: true, user: updatedUser };
  }

  try {
    const token = loadSessionToken();
    await requestJson('/users/me/password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
      token,
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error, 'No fue posible cambiar la contraseña en este momento.'),
    };
  }
}

const authService = {
  changePassword,
  hydrateSession,
  getSessionUser,
  login,
  logout,
  register,
  updateProfile,
};

export { authService };
export default authService;
