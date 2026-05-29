import { useNavigate } from 'react-router-dom';

import OptionalImage from '../components/OptionalImage';
import useCart from '../hooks/useCart';
import styles from '../styles/Cart.module.css';
import { calculateCartSubtotal } from '../utils/calculateOrderTotals';
import { formatCOP } from '../utils/formatCOP';

function Cart() {
  const { cart, cartItems, clearCart, removeCartItem, updateCartItemQuantity } = useCart();
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = calculateCartSubtotal(cartItems);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Carrito</h1>
            <p className={styles.subtitle}>Todavía no tienes productos agregados.</p>
          </div>

          <button type="button" className={styles.btnContinue} onClick={() => navigate('/')}>
            Seguir comprando
          </button>
        </div>

        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>Tu carrito está vacío</h2>
          <p className={styles.emptyText}>
            Vuelve al catálogo, entra a una categoría y agrega productos para continuar.
          </p>
          <button type="button" className={styles.btnContinue} onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Carrito</h1>
          <p className={styles.subtitle}>
            Gestiona cantidades, revisa subtotales y prepara el checkout.
          </p>
        </div>

        <button type="button" className={styles.btnContinue} onClick={() => navigate('/')}>
          Seguir comprando
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.items}>
          <div className={styles.itemList}>
            {cartItems.map((item) => {
              const itemSubtotal = item.price * item.quantity;

              return (
                <article key={item.id} className={styles.item}>
                  <OptionalImage className={styles.image} src={item.image} alt={item.name} />

                  <div className={styles.itemInfo}>
                    {item.category && item.category !== 'Sin categoría' ? (
                      <span className={styles.category}>{item.category}</span>
                    ) : null}
                    <h2 className={styles.name}>{item.name}</h2>
                    <p className={styles.price}>Precio unitario: {formatCOP(item.price)}</p>
                    <p className={styles.stock}>Stock disponible: {item.stockQty ?? item.stock}</p>
                    {item.sku ? <p className={styles.stock}>SKU: {item.sku}</p> : null}
                    <p className={styles.subtotal}>
                      <span className={styles.subtotalLabel}>Subtotal:</span>{' '}
                      {formatCOP(item.lineTotal ?? itemSubtotal)}
                    </p>
                  </div>

                  <div className={styles.actions}>
                    <div className={styles.quantityBox}>
                      <button
                        type="button"
                        className={styles.btnQuantity}
                        onClick={() =>
                          updateCartItemQuantity(item.productId ?? item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className={styles.quantityValue}>{item.quantity}</span>
                      <button
                        type="button"
                        className={styles.btnQuantity}
                        onClick={() =>
                          updateCartItemQuantity(item.productId ?? item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= (item.stockQty ?? item.stock)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.btnRemove}
                      onClick={() => removeCartItem(item.productId ?? item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Resumen</h2>

          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span>Cart ID</span>
              <span className={styles.summaryValue}>{cart.id}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Productos</span>
              <span className={styles.summaryValue}>{cartItems.length}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Unidades</span>
              <span className={styles.summaryValue}>{totalItems}</span>
            </div>

            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span className={styles.summaryValue}>{formatCOP(subtotal)}</span>
            </div>
          </div>

          <button type="button" className={styles.btnClear} onClick={clearCart}>
            Vaciar carrito
          </button>

          <button
            type="button"
            className={styles.btnCheckout}
            onClick={() => navigate('/checkout')}
          >
            Proceder al checkout
          </button>
        </aside>
      </div>
    </section>
  );
}

export default Cart;