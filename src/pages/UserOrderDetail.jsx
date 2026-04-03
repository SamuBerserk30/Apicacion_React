import { useNavigate, useParams } from 'react-router-dom';
import { loadOrders } from '../utils/ordersStorage';
import styles from '../styles/UserOrderDetail.module.css';

const formatCOP = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const orders = loadOrders();
  const order = orders.find((o) => o.id === orderId) ?? null;

  if (!order) {
    return (
      <section className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Orden no encontrada</h1>
          <p>La orden <strong>{orderId}</strong> no existe o fue eliminada.</p>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/user/orders')}
          >
            Volver al historial
          </button>
        </div>
      </section>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate('/user/orders')}
        >
          ← Volver al historial
        </button>

        <header className={styles.header}>
          <h1 className={styles.title}>Detalle de orden</h1>
          <p className={styles.orderId}>{order.id}</p>
          <p className={styles.date}>{formattedDate}</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Cliente</h2>
          <p>{order.customer.fullName}</p>
          <p>{order.customer.email}</p>
          <p>{order.customer.phone}</p>
          <p>{order.customer.address}, {order.customer.city} - {order.customer.postalCode}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Productos</h2>
          {order.items.map((item) => (
            <article key={item.id} className={styles.item}>
              <img src={item.image || null} alt={item.name} className={styles.image} />
              <div className={styles.itemInfo}>
                <h3>{item.name}</h3>
                <p>{item.quantity} x {formatCOP(item.price)}</p>
              </div>
              <strong>{formatCOP(item.quantity * item.price)}</strong>
            </article>
          ))}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Envío y pago</h2>
          <p>{order.shippingMethod.label} — {order.shippingMethod.description}</p>
          <p>{order.paymentMethod.label} — {order.paymentMethod.description}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Totales</h2>
          <div className={styles.totals}>
            <div><span>Subtotal</span><strong>{formatCOP(order.totals.subtotal)}</strong></div>
            <div><span>IVA</span><strong>{formatCOP(order.totals.tax)}</strong></div>
            <div><span>Envío</span><strong>{formatCOP(order.totals.shipping)}</strong></div>
            <div className={styles.totalFinal}><span>Total</span><strong>{formatCOP(order.totals.total)}</strong></div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default OrderDetail;