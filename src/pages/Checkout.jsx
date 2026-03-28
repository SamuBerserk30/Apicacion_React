import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../styles/Checkout.module.css';
import {
  calculateOrderTotals,
  PAYMENT_METHODS,
  SHIPPING_OPTIONS,
} from '../utils/calculateOrderTotals';

const EMAIL_REGEX = /^[^@]+@[^@]+\.[^@]+$/;

function Checkout({ cartItems, user, onBack, onCompleteCheckout }) {
  const [values, setValues] = useState({
    fullName: user?.name ?? '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    shippingMethod: SHIPPING_OPTIONS[0].id,
    paymentMethod: PAYMENT_METHODS[0].id,
  });
  const [errors, setErrors] = useState({});

  const totals = useMemo(
    () => calculateOrderTotals(cartItems, values.shippingMethod),
    [cartItems, values.shippingMethod]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
  };

  const validateValues = () => {
    const nextErrors = {};

    if (!values.fullName.trim()) nextErrors.fullName = 'Ingresa el nombre completo.';
    if (!values.email.trim()) nextErrors.email = 'Ingresa un correo electrónico.';
    if (values.email.trim() && !EMAIL_REGEX.test(values.email.trim())) {
      nextErrors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!values.phone.trim()) nextErrors.phone = 'Ingresa un número de contacto.';
    if (!values.address.trim()) nextErrors.address = 'Ingresa la dirección de entrega.';
    if (!values.city.trim()) nextErrors.city = 'Ingresa la ciudad.';
    if (!values.postalCode.trim()) nextErrors.postalCode = 'Ingresa el código postal.';
    if (!values.shippingMethod) nextErrors.shippingMethod = 'Selecciona un método de envío.';
    if (!values.paymentMethod) nextErrors.paymentMethod = 'Selecciona un método de pago.';

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateValues();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onCompleteCheckout({
      customer: {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        postalCode: values.postalCode.trim(),
      },
      shippingMethodId: values.shippingMethod,
      paymentMethodId: values.paymentMethod,
    });
  };

  if (cartItems.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.emptyText}>
            No hay productos en el carrito. Regresa para agregar artículos antes de continuar.
          </p>
          <button type="button" className={styles.secondaryButton} onClick={onBack}>
            Volver al carrito
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.subtitle}>Completa tus datos para finalizar el pedido.</p>
        </div>
        <button type="button" className={styles.secondaryButton} onClick={onBack}>
          Volver al carrito
        </button>
      </header>

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <h2 className={styles.sectionTitle}>Datos del cliente</h2>

          <label className={styles.field}>
            <span>Nombre completo</span>
            <input name="fullName" value={values.fullName} onChange={handleChange} />
            {errors.fullName ? <small className={styles.error}>{errors.fullName}</small> : null}
          </label>

          <label className={styles.field}>
            <span>Correo electronico</span>
            <input name="email" value={values.email} onChange={handleChange} />
            {errors.email ? <small className={styles.error}>{errors.email}</small> : null}
          </label>

          <label className={styles.field}>
            <span>Telefono</span>
            <input name="phone" value={values.phone} onChange={handleChange} />
            {errors.phone ? <small className={styles.error}>{errors.phone}</small> : null}
          </label>

          <label className={styles.field}>
            <span>Direccion</span>
            <input name="address" value={values.address} onChange={handleChange} />
            {errors.address ? <small className={styles.error}>{errors.address}</small> : null}
          </label>

          <div className={styles.grid2}>
            <label className={styles.field}>
              <span>Ciudad</span>
              <input name="city" value={values.city} onChange={handleChange} />
              {errors.city ? <small className={styles.error}>{errors.city}</small> : null}
            </label>

            <label className={styles.field}>
              <span>Codigo postal</span>
              <input name="postalCode" value={values.postalCode} onChange={handleChange} />
              {errors.postalCode ? <small className={styles.error}>{errors.postalCode}</small> : null}
            </label>
          </div>

          <h2 className={styles.sectionTitle}>Envio</h2>
          <div className={styles.options}>
            {SHIPPING_OPTIONS.map((option) => (
              <label key={option.id} className={styles.optionCard}>
                <input
                  type="radio"
                  name="shippingMethod"
                  value={option.id}
                  checked={values.shippingMethod === option.id}
                  onChange={handleChange}
                />
                <div>
                  <strong>{option.label}</strong>
                  <p>{option.description}</p>
                  <span>{formatCOP(option.price)}</span>
                </div>
              </label>
            ))}
          </div>
          {errors.shippingMethod ? (
            <small className={styles.error}>{errors.shippingMethod}</small>
          ) : null}

          <h2 className={styles.sectionTitle}>Pago</h2>
          <div className={styles.options}>
            {PAYMENT_METHODS.map((option) => (
              <label key={option.id} className={styles.optionCard}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.id}
                  checked={values.paymentMethod === option.id}
                  onChange={handleChange}
                />
                <div>
                  <strong>{option.label}</strong>
                  <p>{option.description}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.paymentMethod ? <small className={styles.error}>{errors.paymentMethod}</small> : null}

          <button type="submit" className={styles.primaryButton}>
            Confirmar pedido
          </button>
        </form>

        <aside className={styles.summary}>
          <h2 className={styles.sectionTitle}>Resumen</h2>
          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span>Productos</span>
              <span>{cartItems.length}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatCOP(totals.subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>IVA (19%)</span>
              <span>{formatCOP(totals.tax)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Envio</span>
              <span>{formatCOP(totals.shipping)}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>{formatCOP(totals.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;
