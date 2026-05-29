import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import adminService from '../services/adminService';
import styles from '../styles/AdminDashboard.module.css';
import { formatCOP } from '../utils/formatCOP';

function AdminDashboard() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState({ products: [], orders: [], users: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadSnapshot = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const nextSnapshot = await adminService.getDashboardSnapshotAsync();

        if (isMounted) {
          setSnapshot(nextSnapshot);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error && error.message
              ? error.message
              : 'No fue posible cargar el panel administrativo.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, []);

  const { products, orders, users } = snapshot;

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((total, order) => total + (order.totals?.total ?? 0), 0);

    return {
      totalProducts: products.length,
      lowStockProducts: products.filter((product) => Number(product.stock) <= 5).length,
      totalOrders: orders.length,
      totalRevenue: formatCOP(totalRevenue),
      totalUsers: users.length,
      adminUsers: users.filter((user) => user.role === 'ADMIN').length,
    };
  }, [orders, products, users]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const recentUsers = useMemo(() => users.slice(0, 5), [users]);

  if (isLoading) {
    return (
      <section className={styles.container}>
        <div className={styles.card}>
          <p className={styles.emptyText}>Cargando métricas administrativas...</p>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className={styles.container}>
        <div className={styles.card}>
          <p className={styles.emptyText}>{loadError}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Semana 12</p>
          <h1 className={styles.title}>Panel administrativo</h1>
          <p className={styles.subtitle}>
            Esta vista concentra métricas rápidas del sistema y abre la gestión de productos solo
            para usuarios con rol administrador.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={() => navigate('/')}>
            Ir a tienda
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/admin/users')}
          >
            Gestionar usuarios
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/admin/products')}
          >
            Gestionar productos
          </button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Productos activos</span>
          <strong>{stats.totalProducts}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Productos con bajo stock</span>
          <strong>{stats.lowStockProducts}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Órdenes registradas</span>
          <strong>{stats.totalOrders}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Ingresos acumulados</span>
          <strong>{stats.totalRevenue}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Usuarios registrados</span>
          <strong>{stats.totalUsers}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Usuarios admin</span>
          <strong>{stats.adminUsers}</strong>
        </article>
      </div>

      <div className={styles.layout}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Órdenes recientes</h2>
            <span className={styles.helper}>Últimas 5 órdenes guardadas</span>
          </div>

          {recentOrders.length === 0 ? (
            <p className={styles.emptyText}>Todavía no hay órdenes registradas en el sistema.</p>
          ) : (
            <div className={styles.list}>
              {recentOrders.map((order) => (
                <article key={order.id} className={styles.listItem}>
                  <div>
                    <strong>{order.id}</strong>
                    <span>
                      {order.userFullName || order.customer?.fullName || 'Cliente sin nombre'}
                    </span>
                  </div>
                  <div className={styles.listMeta}>
                    <span>{new Date(order.createdAt).toLocaleDateString('es-CO')}</span>
                    <strong>{formatCOP(order.totals.total)}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Usuarios recientes</h2>
            <span className={styles.helper}>Sincronizados desde backend en modo remoto</span>
          </div>

          {recentUsers.length === 0 ? (
            <p className={styles.emptyText}>No hay usuarios registrados.</p>
          ) : (
            <div className={styles.list}>
              {recentUsers.map((user) => (
                <article key={user.id} className={styles.listItem}>
                  <div>
                    <strong>{user.fullName || user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className={styles.listMeta}>
                    <span className={styles.roleBadge}>
                      {user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                    </span>
                    <span className={styles.roleBadge}>
                      {user.status === 'INACTIVE' ? 'Inactivo' : 'Activo'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default AdminDashboard;
