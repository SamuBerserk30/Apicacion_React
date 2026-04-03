import { useNavigate } from 'react-router-dom';
import { loadOrders } from '../utils/ordersStorage';
import styles from '../styles/UserOrders.module.css';

const formatCOP = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);

function UserOrders() {
  const navigate = useNavigate();
  const orders = loadOrders();

  if (orders.length === 0) {
    return (
      <section className={styles.container}>
        <h1 className={styles.title}>Mis órdenes</h1>
        <div className={styles.empty}>
          <p>No tienes compras registradas todavía.</p>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/')}
          >
            Ir a comprar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Mis órdenes</h1>
      <div className={styles.list}>
        {orders.map((order) => {
          const date = new Date(order.createdAt).toLocaleDateString('es-CO', {
            dateStyle: 'medium',
          });
          const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

          return (
            <article
              key={order.id}
              className={styles.card}
              onClick={() => navigate(`/user/orders/${order.id}`)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.orderId}>{order.id}</span>
                <span className={styles.date}>{date}</span>
              </div>
              <div className={styles.cardBody}>
                <span>{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</span>
                <strong>{formatCOP(order.totals.total)}</strong>
              </div>
              <div className={styles.cardFooter}>
                <span>{order.shippingMethod.label}</span>
                <span>{order.paymentMethod.label}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default UserOrders;