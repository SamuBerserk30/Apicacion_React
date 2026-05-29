const STORAGE_KEY = 'cartItems';
const CART_UPDATED_EVENT = 'cart:changed';

const createLocalCartId = () => `CART-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const clampQuantity = (value, maxStock) => {
  const parsed = Number(value);
  const normalizedMaxStock =
    Number.isFinite(Number(maxStock)) && Number(maxStock) > 0 ? Number(maxStock) : 1;

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(normalizedMaxStock, Math.max(1, Math.floor(parsed)));
};

const normalizeCartItem = (item) => {
  const productId = Number(item?.productId ?? item?.id);
  const productStock =
    Number.isFinite(Number(item?.productStock ?? item?.stockQty ?? item?.stock)) &&
    Number(item?.productStock ?? item?.stockQty ?? item?.stock) >= 0
      ? Number(item?.productStock ?? item?.stockQty ?? item?.stock)
      : 0;
  const unitPrice = Number(item?.unitPrice ?? item?.price) || 0;
  const quantity = clampQuantity(item?.quantity, productStock || 1);

  return {
    id: Number(item?.id ?? productId),
    productId,
    sku: String(item?.sku ?? ''),
    name: String(item?.name ?? 'Producto'),
    category: String(item?.categoryName ?? item?.category ?? 'Sin categoría'),
    categoryName: String(item?.categoryName ?? item?.category ?? 'Sin categoría'),
    price: unitPrice,
    unitPrice,
    lineTotal: Number(item?.lineTotal) || unitPrice * quantity,
    stock: productStock,
    stockQty: productStock,
    productStock,
    productAvailable: Boolean(item?.productAvailable ?? productStock > 0),
    image: String(item?.image ?? ''),
    quantity,
    addedAt: String(item?.addedAt ?? new Date().toISOString()),
  };
};

const normalizeSummary = (items) => {
  const normalizedItems = Array.isArray(items) ? items.map(normalizeCartItem) : [];
  const subtotal = normalizedItems.reduce((total, item) => total + item.lineTotal, 0);
  const itemsCount = normalizedItems.reduce((total, item) => total + item.quantity, 0);

  return {
    itemsCount,
    subtotal,
    tax: 0,
    shipping: 0,
    total: subtotal,
  };
};

const normalizeCart = (cart) => {
  const itemsSource = Array.isArray(cart?.items) ? cart.items : cart;
  const items = Array.isArray(itemsSource) ? itemsSource.map(normalizeCartItem) : [];
  const summary = normalizeSummary(items);

  return {
    id: String(cart?.id ?? createLocalCartId()),
    userId: String(cart?.userId ?? ''),
    userEmail: String(cart?.userEmail ?? ''),
    status: String(cart?.status ?? 'OPEN'),
    isGuest: Boolean(cart?.isGuest ?? !cart?.userId),
    createdAt: String(cart?.createdAt ?? new Date().toISOString()),
    updatedAt: String(cart?.updatedAt ?? new Date().toISOString()),
    items,
    summary,
  };
};

export function loadCartItems() {
  return loadCart().items;
}

export function loadCart() {
  if (typeof window === 'undefined') {
    return normalizeCart([]);
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return normalizeCart([]);
  }

  try {
    const parsed = JSON.parse(stored);

    if (Array.isArray(parsed)) {
      return normalizeCart({ items: parsed });
    }

    return normalizeCart(parsed);
  } catch {
    return normalizeCart([]);
  }
}

export function saveCartItems(items) {
  const currentCart = loadCart();
  return saveCart({ ...currentCart, items });
}

export function saveCart(cart) {
  const normalizedCart = normalizeCart(cart);

  if (typeof window === 'undefined') {
    return normalizedCart;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedCart));
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: normalizedCart }));

  return normalizedCart;
}

export const CART_STORAGE_KEY = STORAGE_KEY;
export { CART_UPDATED_EVENT };
