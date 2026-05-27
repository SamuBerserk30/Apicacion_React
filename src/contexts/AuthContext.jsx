import { createContext, useEffect, useState } from 'react';

import { appConfig } from '../config';
import {
  clearSessionToken,
  clearSessionUser,
  createUser,
  findUserByEmail,
  loadSessionToken,
  loadSessionUser,
  saveSessionToken,
  saveSessionUser,
} from '../utils/authStorage';

const AuthContext = createContext(null);

// ─── helpers locales ──────────────────────────────────────────────────────────

function registerLocal({ firstName, lastName, email, password }) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const normalizedFirstName = String(firstName ?? '').trim();
  const normalizedLastName = String(lastName ?? '').trim();

  if (!normalizedFirstName) return { ok: false, error: 'Ingresa tu nombre.' };
  if (!normalizedLastName) return { ok: false, error: 'Ingresa tu apellido.' };
  if (!normalizedEmail) return { ok: false, error: 'Ingresa un correo electrónico válido.' };
  if (!password || password.length < 8)
    return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
  if (findUserByEmail(normalizedEmail))
    return { ok: false, error: 'Ya existe una cuenta registrada con ese correo.' };

  const user = createUser({
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    email: normalizedEmail,
    password,
  });
  saveSessionUser(user);
  return { ok: true, user };
}

function loginLocal({ email, password }) {
  const user = findUserByEmail(String(email ?? '').trim().toLowerCase());
  if (!user || user.password !== password)
    return { ok: false, error: 'Credenciales inválidas. Verifica correo y contraseña.' };
  saveSessionUser(user);
  return { ok: true, user };
}

// ─── helpers remotos ──────────────────────────────────────────────────────────

const toSessionUser = (raw) => {
  if (!raw) return null;
  const firstName = String(raw.firstName ?? '').trim();
  const lastName = String(raw.lastName ?? '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  return {
    id: raw.id ?? raw.userId,
    firstName,
    lastName,
    fullName,
    name: fullName,
    email: String(raw.email ?? '').trim().toLowerCase(),
    role: String(raw.role ?? 'CUSTOMER').toUpperCase(),
    phone: String(raw.phone ?? '').trim(),
    status: String(raw.status ?? 'ACTIVE'),
    createdAt: String(raw.createdAt ?? ''),
  };
};

// Llama al backend directamente sin pasar por requestJson
// para tener control total del error y no caer a local si el backend está activo
async function callBackend(path, body) {
  const response = await fetch(`/api/v1${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Muestra el mensaje real del backend si lo hay
    const message =
      data?.message ?? data?.error ?? `Error ${response.status} del servidor.`;
    throw new Error(message);
  }

  return data;
}

async function registerRemote(payload) {
  // Intenta backend primero
  const response = await callBackend('/auth/register', {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    password: payload.password,
    phone: payload.phone ?? null,
    guestCartId: null,
  });

  // El backend devuelve { sessionToken, user, cart }
  const user = toSessionUser(response?.user);
  if (!user) throw new Error('El servidor no devolvió datos de usuario.');

  saveSessionUser(user);
  saveSessionToken(response.sessionToken ?? '');
  return { ok: true, user };
}

async function loginRemote(payload) {
  const response = await callBackend('/auth/login', {
    email: payload.email,
    password: payload.password,
    guestCartId: null,
  });

  const user = toSessionUser(response?.user);
  if (!user) throw new Error('El servidor no devolvió datos de usuario.');

  saveSessionUser(user);
  saveSessionToken(response.sessionToken ?? '');
  return { ok: true, user };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadSessionUser);
  const [isHydratingSession, setIsHydratingSession] = useState(false);

  useEffect(() => {
    const token = loadSessionToken();
    const storedUser = loadSessionUser();

    if (!appConfig.useRemoteApi || !token) {
      setCurrentUser(storedUser);
      return;
    }

    setIsHydratingSession(true);
    fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const user = toSessionUser(data?.user ?? data);
        if (user) { saveSessionUser(user); setCurrentUser(user); }
        else setCurrentUser(storedUser);
      })
      .catch(() => setCurrentUser(storedUser))
      .finally(() => setIsHydratingSession(false));
  }, []);

  const login = async (payload) => {
    if (appConfig.useRemoteApi) {
      try {
        const result = await loginRemote(payload);
        setCurrentUser(result.user);
        return result;
      } catch (error) {
        // Solo cae a local si el backend está caído (error de red)
        // Si el backend responde con error (credenciales), lo muestra
        if (error.message.startsWith('Error') || error.message.includes('servidor')) {
          return loginLocal(payload);
        }
        return { ok: false, error: error.message };
      }
    }
    const result = loginLocal(payload);
    if (result.ok) setCurrentUser(result.user);
    return result;
  };

  const register = async (payload) => {
    if (appConfig.useRemoteApi) {
      try {
        const result = await registerRemote(payload);
        setCurrentUser(result.user);
        return result;
      } catch (error) {
        // Si es error de red (fetch falla), cae a local
        // Si es error del backend (400, 409), muestra el mensaje real
        if (error instanceof TypeError) {
          // TypeError = backend caído, usamos local
          const result = registerLocal(payload);
          if (result.ok) setCurrentUser(result.user);
          return result;
        }
        return { ok: false, error: error.message };
      }
    }
    const result = registerLocal(payload);
    if (result.ok) setCurrentUser(result.user);
    return result;
  };

  const logout = async () => {
    if (appConfig.useRemoteApi) {
      const token = loadSessionToken();
      if (token) {
        fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    }
    clearSessionUser();
    clearSessionToken();
    setCurrentUser(null);
    return { ok: true };
  };

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isAdmin: currentUser?.role === 'ADMIN',
    isHydratingSession,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };