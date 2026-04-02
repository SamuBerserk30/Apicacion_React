import { useNavigate } from 'react-router-dom';

import styles from '../styles/OrderConfirmation.module.css';

const formatCOP = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

function OrderConfirmation({ order, onBackHome }) {
  const navigate = useNavigate();
  const handleBackHome = () => {
    onBackHome();
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/user/orders');
  };

  if (!order) {
    return (
      <section className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>No hay una orden reciente</h1>
          <p className={styles.subtitle}>
            El checkout ya se cerró o no existe una compra para mostrar en esta vista.
          </p>
          <button type="button" className={styles.primaryButton} onClick={handleBackHome}>
            Volver al inicio
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
        <header className={styles.header}>
          <h1 className={styles.title}>Compra confirmada</h1>
          <p className={styles.subtitle}>Tu pedido fue registrado correctamente.</p>
        </header>

        <div className={styles.metaGrid}>
          <div>
            <span className={styles.metaLabel}>Orden</span>
            <p className={styles.metaValue}>{order.id}</p>
          </div>
          <div>
            <span className={styles.metaLabel}>Fecha</span>
            <p className={styles.metaValue}>{formattedDate}</p>
          </div>
          <div>
            <span className={styles.metaLabel}>Envio</span>
            <p className={styles.metaValue}>{order.shippingMethod.label}</p>
          </div>
          <div>
            <span className={styles.metaLabel}>Pago</span>
            <p className={styles.metaValue}>{order.paymentMethod.label}</p>
          </div>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Datos del cliente</h2>
          <p>{order.customer.fullName}</p>
          <p>{order.customer.email}</p>
          <p>{order.customer.phone}</p>
          <p>{order.customer.address}</p>
          <p>
            {order.customer.city} - {order.customer.postalCode}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Productos</h2>
          <div className={styles.items}>
            {order.items.map((item) => (
              <article key={item.id} className={styles.item}>
                  <img src={item.image || null} alt={item.name} className={styles.image} />
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p>
                    {item.quantity} x {formatCOP(item.price)}
                  </p>
                </div>
                <strong>{formatCOP(item.quantity * item.price)}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Totales</h2>
          <div className={styles.totals}>
            <div><span>Subtotal</span><strong>{formatCOP(order.totals.subtotal)}</strong></div>
            <div><span>IVA</span><strong>{formatCOP(order.totals.tax)}</strong></div>
            <div><span>Envio</span><strong>{formatCOP(order.totals.shipping)}</strong></div>
            <div className={styles.totalFinal}><span>Total</span><strong>{formatCOP(order.totals.total)}</strong></div>
          </div>
        </section>

        <button type="button" className={styles.primaryButton} onClick={handleBackHome}>
          Volver al inicio
        </button>
      </div>
    </section>
  );
}

export default OrderConfirmation;