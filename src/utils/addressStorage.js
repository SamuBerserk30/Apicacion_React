const STORAGE_KEY = 'userAddresses';

const ADDRESS_TYPES = new Set(['SHIPPING', 'BILLING']);

const normalizeAddressType = (type) => {
  const normalizedType = String(type ?? '')
    .trim()
    .toUpperCase();

  return ADDRESS_TYPES.has(normalizedType) ? normalizedType : 'SHIPPING';
};

const normalizeAddress = (address) => ({
  id: String(address?.id ?? `ADDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
  userId: String(address?.userId ?? '').trim(),
  type: normalizeAddressType(address?.type),
  line1: String(address?.line1 ?? '').trim(),
  line2: String(address?.line2 ?? '').trim(),
  city: String(address?.city ?? '').trim(),
  state: String(address?.state ?? '').trim(),
  country: String(address?.country ?? 'Colombia').trim(),
  postalCode: String(address?.postalCode ?? '').trim(),
  isDefault: Boolean(address?.isDefault),
  createdAt: String(address?.createdAt ?? new Date().toISOString()),
  updatedAt: String(address?.updatedAt ?? new Date().toISOString()),
});

const readAddresses = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(normalizeAddress) : [];
  } catch {
    return [];
  }
};

const writeAddresses = (addresses) => {
  const normalizedAddresses = Array.isArray(addresses) ? addresses.map(normalizeAddress) : [];

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedAddresses));
  }

  return normalizedAddresses;
};

const ensureSingleDefault = (addresses, selectedId) =>
  addresses.map((address) => ({
    ...address,
    isDefault: address.id === selectedId,
  }));

export function loadAddressesByUserId(userId) {
  const normalizedUserId = String(userId ?? '').trim();

  if (!normalizedUserId) {
    return [];
  }

  return readAddresses().filter((address) => address.userId === normalizedUserId);
}

export function replaceAddressesByUserId(userId, addresses) {
  const normalizedUserId = String(userId ?? '').trim();

  if (!normalizedUserId) {
    return [];
  }

  const nextUserAddresses = (Array.isArray(addresses) ? addresses : [])
    .map((address) => normalizeAddress({ ...address, userId: normalizedUserId }))
    .filter((address) => address.userId === normalizedUserId);
  const otherUsersAddresses = readAddresses().filter(
    (storedAddress) => storedAddress.userId !== normalizedUserId
  );

  return writeAddresses([...otherUsersAddresses, ...nextUserAddresses]).filter(
    (storedAddress) => storedAddress.userId === normalizedUserId
  );
}

export function saveAddress(address) {
  const normalizedAddress = normalizeAddress(address);
  const currentAddresses = readAddresses().filter(
    (storedAddress) => storedAddress.id !== normalizedAddress.id
  );
  const sameUserAddresses = currentAddresses.filter(
    (storedAddress) => storedAddress.userId === normalizedAddress.userId
  );
  const otherAddresses = currentAddresses.filter(
    (storedAddress) => storedAddress.userId !== normalizedAddress.userId
  );

  const nextSameUserAddresses = normalizedAddress.isDefault
    ? ensureSingleDefault([...sameUserAddresses, normalizedAddress], normalizedAddress.id)
    : [...sameUserAddresses, normalizedAddress];

  return writeAddresses([...otherAddresses, ...nextSameUserAddresses]).find(
    (storedAddress) => storedAddress.id === normalizedAddress.id
  );
}

export function deleteAddress(userId, addressId) {
  const normalizedUserId = String(userId ?? '').trim();
  const normalizedAddressId = String(addressId ?? '').trim();

  const filteredAddresses = readAddresses().filter(
    (address) => !(address.userId === normalizedUserId && address.id === normalizedAddressId)
  );
  const sameUserAddresses = filteredAddresses.filter(
    (address) => address.userId === normalizedUserId
  );

  if (sameUserAddresses.length > 0 && !sameUserAddresses.some((address) => address.isDefault)) {
    sameUserAddresses[0] = { ...sameUserAddresses[0], isDefault: true };
    const remainingAddresses = filteredAddresses.filter(
      (address) => address.userId !== normalizedUserId
    );
    writeAddresses([...remainingAddresses, ...sameUserAddresses]);
    return;
  }

  writeAddresses(filteredAddresses);
}

export function setDefaultAddress(userId, addressId) {
  const normalizedUserId = String(userId ?? '').trim();
  const normalizedAddressId = String(addressId ?? '').trim();
  const currentAddresses = readAddresses();
  const sameUserAddresses = currentAddresses.filter(
    (address) => address.userId === normalizedUserId
  );
  const otherAddresses = currentAddresses.filter((address) => address.userId !== normalizedUserId);

  return writeAddresses([
    ...otherAddresses,
    ...ensureSingleDefault(sameUserAddresses, normalizedAddressId),
  ]).filter((address) => address.userId === normalizedUserId);
}
