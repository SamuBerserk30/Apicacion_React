import authService from './authService';
import orderService from './orderService';
import productService from './productService';

function getDashboardSnapshot() {
  return {
    products: productService.getProducts(),
    orders: orderService.getOrders(),
    users: authService.getAdminUsers(),
  };
}

async function getDashboardSnapshotAsync() {
  const [products, orders, users] = await Promise.all([
    productService.getProductsAsync(),
    orderService.getOrdersAsync(),
    authService.getAdminUsersAsync(),
  ]);

  return {
    products,
    orders,
    users,
  };
}

const adminService = {
  getDashboardSnapshot,
  getDashboardSnapshotAsync,
};

export { adminService };
export default adminService;
