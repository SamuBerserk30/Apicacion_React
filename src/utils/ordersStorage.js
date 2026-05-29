const STORAGE_KEY = 'orders';

const normalizeOrderItem = (item) => {
  const productId = Number(item?.productId ?? item?.id);
  const quantity = Math.max(1, Math.floor(Number(item?.quantity) || 1));
  const unitPrice = Number(item?.unitPrice ?? item?.price) || 0;

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
    stock: Number(item?.productStock ?? item?.stockQty ?? item?.stock) || 0,
    stockQty: Number(item?.productStock ?? item?.stockQty ?? item?.stock) || 0,
    productStock: Number(item?.productStock ?? item?.stockQty ?? item?.stock) || 0,
    image: String(item?.image ?? ''),
    quantity,
  };
};

const normalizeOrder = (order) => {
  const normalizedId = String(order?.id ?? '');
  const normalizedItems = Array.isArray(order?.items) ? order.items.map(normalizeOrderItem) : [];
  const normalizedTotals = {
    subtotal: Number(order?.totals?.subtotal) || 0,
    tax: Number(order?.totals?.tax) || 0,
    shipping: Number(order?.totals?.shipping) || 0,
    total:
      Number(order?.totals?.total) ||
      (Number(order?.totals?.subtotal) || 0) +
        (Number(order?.totals?.tax) || 0) +
        (Number(order?.totals?.shipping) || 0),
  };

  return {
    id: normalizedId,
    orderNumber: String(order?.orderNumber ?? normalizedId),
    cartId: String(order?.cartId ?? ''),
    userId: String(order?.userId ?? ''),
    userEmail: String(order?.userEmail ?? order?.customer?.email ?? ''),
    userFullName: String(order?.userFullName ?? order?.customer?.fullName ?? ''),
    status: String(order?.status ?? 'PENDING'),
    createdAt: String(order?.createdAt ?? new Date().toISOString()),
    items: normalizedItems,
    customer: {
      fullName: String(
        order?.customer?.fullName ?? order?.userFullName ?? order?.shippingAddress?.fullName ?? ''
      ),
      email: String(order?.customer?.email ?? order?.userEmail ?? ''),
      phone: String(order?.customer?.phone ?? ''),
      address: String(order?.customer?.address ?? order?.shippingAddress?.line1 ?? ''),
      city: String(order?.customer?.city ?? order?.shippingAddress?.city ?? ''),
      postalCode: String(order?.customer?.postalCode ?? order?.shippingAddress?.postalCode ?? ''),
    },
    shippingAddress: {
      id: String(order?.shippingAddress?.id ?? ''),
      type: String(order?.shippingAddress?.type ?? 'SHIPPING'),
      line1: String(order?.shippingAddress?.line1 ?? order?.customer?.address ?? ''),
      line2: String(order?.shippingAddress?.line2 ?? ''),
      city: String(order?.shippingAddress?.city ?? order?.customer?.city ?? ''),
      state: String(order?.shippingAddress?.state ?? ''),
      country: String(order?.shippingAddress?.country ?? 'Colombia'),
      postalCode: String(order?.shippingAddress?.postalCode ?? order?.customer?.postalCode ?? ''),
      isDefault: Boolean(order?.shippingAddress?.isDefault),
    },
    billingAddress: {
      id: String(order?.billingAddress?.id ?? order?.shippingAddress?.id ?? ''),
      type: String(order?.billingAddress?.type ?? 'BILLING'),
      line1: String(
        order?.billingAddress?.line1 ??
          order?.customer?.address ??
          order?.shippingAddress?.line1 ??
          ''
      ),
      line2: String(order?.billingAddress?.line2 ?? ''),
      city: String(order?.billingAddress?.city ?? order?.customer?.city ?? ''),
      state: String(order?.billingAddress?.state ?? ''),
      country: String(order?.billingAddress?.country ?? 'Colombia'),
      postalCode: String(order?.billingAddress?.postalCode ?? order?.customer?.postalCode ?? ''),
      isDefault: Boolean(order?.billingAddress?.isDefault),
    },
    totals: normalizedTotals,
  };
};

export function loadOrders() {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeOrder).filter((order) => order.id);
  } catch {
    return [];
  }
}

export function saveOrder(order) {
  const normalizedOrder = normalizeOrder(order);

  if (typeof window === 'undefined') {
    return normalizedOrder;
  }

  const currentOrders = loadOrders();

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([normalizedOrder, ...currentOrders]));

  return normalizedOrder;
}

export function saveOrders(orders) {
  const normalizedOrders = Array.isArray(orders) ? orders.map(normalizeOrder) : [];

  if (typeof window === 'undefined') {
    return normalizedOrders;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedOrders));

  return normalizedOrders;
}

export function loadOrdersByUserId(userId) {
  const normalizedUserId = String(userId ?? '').trim();

  if (!normalizedUserId) {
    return [];
  }

  return loadOrders().filter((order) => order.userId === normalizedUserId);
}

export const ORDERS_STORAGE_KEY = STORAGE_KEY;
