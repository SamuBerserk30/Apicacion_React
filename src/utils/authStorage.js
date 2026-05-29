const USERS_STORAGE_KEY = 'authUsers';
const SESSION_STORAGE_KEY = 'authSession';
const TOKEN_STORAGE_KEY = 'authToken';
const DEFAULT_ROLE = 'CUSTOMER';
const ADMIN_ROLE = 'ADMIN';
const DEFAULT_ADMIN_USER = {
  id: 'USR-ADMIN-001',
  firstName: 'Admin',
  lastName: 'CESDE',
  fullName: 'Admin CESDE',
  email: 'admin@cesde.local',
  password: 'Admin123!',
  role: ADMIN_ROLE,
  phone: '3000000000',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
};

const buildFullName = (firstName, lastName, fallback = '') => {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return fullName || String(fallback ?? '').trim();
};

const normalizeRole = (role) => {
  const normalizedRole = String(role ?? '')
    .trim()
    .toUpperCase();

  if (normalizedRole === ADMIN_ROLE || normalizedRole === 'ADMIN') {
    return ADMIN_ROLE;
  }

  if (
    normalizedRole === DEFAULT_ROLE ||
    normalizedRole === 'CUSTOMER' ||
    normalizedRole === 'USER'
  ) {
    return DEFAULT_ROLE;
  }

  return DEFAULT_ROLE;
};

const normalizeUser = (user) => {
  const firstName = String(user?.firstName ?? '').trim();
  const lastName = String(user?.lastName ?? '').trim();
  const fullName = buildFullName(firstName, lastName, user?.fullName ?? user?.name);

  return {
    id: String(user?.id ?? ''),
    firstName,
    lastName,
    fullName,
    name: fullName,
    email: String(user?.email ?? '')
      .trim()
      .toLowerCase(),
    password: String(user?.password ?? ''),
    role: normalizeRole(user?.role),
    phone: String(user?.phone ?? '').trim(),
    status: String(user?.status ?? 'ACTIVE').trim() || 'ACTIVE',
    createdAt: String(user?.createdAt ?? new Date().toISOString()),
  };
};

const sanitizeSessionUser = (user) => {
  const normalizedUser = normalizeUser(user);

  if (!normalizedUser.id || !normalizedUser.email) {
    return null;
  }

  return {
    id: normalizedUser.id,
    firstName: normalizedUser.firstName,
    lastName: normalizedUser.lastName,
    fullName: normalizedUser.fullName,
    name: normalizedUser.name,
    email: normalizedUser.email,
    role: normalizedUser.role,
    phone: normalizedUser.phone,
    status: normalizedUser.status,
    createdAt: normalizedUser.createdAt,
  };
};

const readStorageArray = (storageKey) => {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const ensureAdminUser = (users) => {
  const normalizedUsers = Array.isArray(users)
    ? users
        .map(normalizeUser)
        .filter((user) => user.id && user.fullName && user.email && user.password)
    : [];

  const hasAdmin = normalizedUsers.some((user) => user.role === ADMIN_ROLE);

  if (hasAdmin) {
    return normalizedUsers;
  }

  return [normalizeUser(DEFAULT_ADMIN_USER), ...normalizedUsers];
};

export function loadUsers() {
  const users = ensureAdminUser(readStorageArray(USERS_STORAGE_KEY));

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  return users;
}

export function saveUsers(users) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedUsers = Array.isArray(users) ? users.map(normalizeUser) : [];
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(normalizedUsers));
}

export function findUserByEmail(email) {
  const normalizedEmail = String(email ?? '')
    .trim()
    .toLowerCase();
  return loadUsers().find((user) => user.email === normalizedEmail) ?? null;
}

export function createUser(userData) {
  const nextUser = normalizeUser({
    ...userData,
    id: `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    role: DEFAULT_ROLE,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  });
  const currentUsers = loadUsers();

  saveUsers([...currentUsers, nextUser]);

  return sanitizeSessionUser(nextUser);
}

export function updateUser(userId, updates) {
  const normalizedUserId = String(userId ?? '').trim();

  if (!normalizedUserId) {
    return null;
  }

  let updatedSessionUser = null;
  const nextUsers = loadUsers().map((user) => {
    if (user.id !== normalizedUserId) {
      return user;
    }

    const updatedUser = normalizeUser({ ...user, ...updates, id: user.id });
    updatedSessionUser = sanitizeSessionUser(updatedUser);
    return updatedUser;
  });

  saveUsers(nextUsers);

  if (updatedSessionUser) {
    saveSessionUser(updatedSessionUser);
  }

  return updatedSessionUser;
}

export function loadSessionUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return sanitizeSessionUser(JSON.parse(stored));
  } catch {
    return null;
  }
}

export function saveSessionUser(user) {
  if (typeof window === 'undefined') {
    return;
  }

  const sanitizedUser = sanitizeSessionUser(user);

  if (!sanitizedUser) {
    clearSessionUser();
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sanitizedUser));
}

export function loadSessionToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return String(window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '');
}

export function saveSessionToken(token) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedToken = String(token ?? '').trim();

  if (!normalizedToken) {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, normalizedToken);
}

export function clearSessionToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function clearSessionUser() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export {
  ADMIN_ROLE,
  DEFAULT_ADMIN_USER,
  DEFAULT_ROLE,
  SESSION_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  USERS_STORAGE_KEY,
};
