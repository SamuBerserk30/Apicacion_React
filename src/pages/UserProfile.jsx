import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import styles from '../styles/UserProfile.module.css';
import { loadOrdersByUserId } from '../utils/ordersStorage'; // ← import que faltaba

const formatCOP = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

function UserProfile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const orders = useMemo(() => loadOrdersByUserId(currentUser?.id), [currentUser?.id]);
  const latestOrder = orders[0] ?? null;

  const profile = {
    name: currentUser?.fullName || currentUser?.name || 'Invitado',
    email: currentUser?.email || 'Sin correo registrado',
    phone: currentUser?.phone || latestOrder?.customer?.phone || 'Sin teléfono registrado',
    address: currentUser?.address || latestOrder?.customer?.address || 'Aún no hay dirección registrada',
    city: currentUser?.city || latestOrder?.customer?.city || 'Sin ciudad registrada',
    postalCode: currentUser?.postalCode || latestOrder?.customer?.postalCode || '---',
  };

  const stats = {
    totalOrders: orders.length,
    latestOrderId: latestOrder?.id ?? 'Sin compras',
    latestTotal: latestOrder ? formatCOP(latestOrder.totals.total) : 'Sin compras',
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Semana 11</p>
          <h1 className={styles.title}>Mi cuenta</h1>
          <p className={styles.subtitle}>
            Esta vista centraliza la sesión autenticada y un resumen rápido de las órdenes del
            usuario actual.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/user/orders')}
          >
            Ver historial
          </button>
          <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Datos del perfil</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Nombre</span>
              <strong>{profile.name}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Correo</span>
              <strong>{profile.email}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Teléfono</span>
              <strong>{profile.phone}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Dirección</span>
              <strong>{profile.address}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Ciudad</span>
              <strong>{profile.city}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Código postal</span>
              <strong>{profile.postalCode}</strong>
            </div>
          </div>
        </section>

        <aside className={styles.card}>
          <h2 className={styles.sectionTitle}>Resumen de compras</h2>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.label}>Órdenes guardadas</span>
              <strong>{stats.totalOrders}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.label}>Última orden</span>
              <strong>{stats.latestOrderId}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.label}>Último total</span>
              <strong>{stats.latestTotal}</strong>
            </div>
          </div>

          {latestOrder ? (
            <div className={styles.latestOrder}>
              <p className={styles.latestOrderText}>
                Tu compra más reciente fue enviada con{' '}
                <strong>{latestOrder.shippingMethod?.label ?? 'envío estándar'}</strong> y pagada con{' '}
                <strong>{latestOrder.paymentMethod?.label ?? 'tarjeta'}</strong>.
              </p>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate(`/user/orders/${latestOrder.id}`)}
              >
                Abrir última orden
              </button>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                Aún no hay compras registradas. Cuando completes el checkout, el historial quedará
                disponible desde esta sección.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default UserProfile;
