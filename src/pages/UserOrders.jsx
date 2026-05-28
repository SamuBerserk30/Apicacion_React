import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import styles from '../styles/UserOrders.module.css';
import { loadOrdersByUserId } from '../utils/ordersStorage';

function UserOrders() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const orders = useMemo(
    () =>
      loadOrdersByUserId(currentUser?.id).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [currentUser?.id]
  );

  if (orders.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.eyebrow}>Usuario</p>
          <h1 className={styles.title}>Mis ordenes</h1>
          <p className={styles.subtitle}>
            Todavía no hay compras asociadas a tu sesión. Completa el checkout autenticado para
            poblar esta vista.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate('/user/profile')}
            >
              Ir al perfil
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => navigate('/')}
            >
              Explorar productos
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Usuario</p>
          <h1 className={styles.title}>Historial de ordenes</h1>
          <p className={styles.subtitle}>
            Recupera únicamente las compras del usuario autenticado.
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/user/profile')}
          >
            Mi perfil
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </button>
        </div>
      </header>

      <div className={styles.list}>
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              marginBottom: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#1a1a2e' }}>
                Orden #{order.orderNumber ?? order.id}
              </p>
              <p style={{ margin: '0.25rem 0', color: '#6b7280', fontSize: '0.85rem' }}>
                {new Date(order.createdAt).toLocaleDateString('es-CO')}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                {order.items?.length ?? 0} producto(s)
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/user/orders/${order.id}`)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#6c63ff',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.9rem',
              }}
            >
              Ver detalle
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UserOrders;