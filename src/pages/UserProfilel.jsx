import { useNavigate } from 'react-router-dom';
import { loadOrders } from '../utils/ordersStorage';
import styles from '../styles/UserProfile.module.css';

function UserProfile() {
  const navigate = useNavigate();
  const orders = loadOrders();
  const lastOrder = orders[0] ?? null;
  const customer = lastOrder?.customer ?? null;
  const displayName = customer?.fullName || 'Usuario';
  const displayEmail = customer?.email || 'Sin email registrado';

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.avatar}>{displayName.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className={styles.name}>{displayName}</h1>
            <p className={styles.email}>{displayEmail}</p>
          </div>
        </header>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{orders.length}</span>
            <span className={styles.statLabel}>
              {orders.length === 1 ? 'Orden' : 'Órdenes'}
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className={styles.empty}>Aún no has realizado ninguna compra.</p>
        ) : (
          <p className={styles.subtitle}>
            Tu última compra fue el{' '}
            {new Date(lastOrder.createdAt).toLocaleDateString('es-CO', { dateStyle: 'long' })}.
          </p>
        )}

        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => navigate('/user/orders')}
        >
          Ver mis órdenes
        </button>
      </div>
    </section>
  );
}

export default UserProfile;