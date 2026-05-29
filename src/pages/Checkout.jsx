import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OptionalImage from '../components/OptionalImage';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import addressService from '../services/addressService';
import styles from '../styles/Checkout.module.css';
import { calculateOrderTotals } from '../utils/calculateOrderTotals';
import { formatCOP } from '../utils/formatCOP';

const EMAIL_REGEX = /^[^@]+@[^@]+\.[^@]+$/;

function Checkout({ onCompleteCheckout }) {
  const { currentUser: user } = useAuth();
  const { cart, cartItems } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressesError, setAddressesError] = useState('');
  const [values, setValues] = useState({
    fullName: user?.fullName ?? user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    shippingAddressId: '',
    billingAddressId: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadAddresses = async () => {
      setIsLoadingAddresses(true);
      setAddressesError('');

      try {
        const userAddresses = await addressService.getAddressesByUserIdAsync(user?.id);
        const defaultAddress =
          userAddresses.find((address) => address.isDefault) ?? userAddresses[0] ?? null;

        if (!isMounted) {
          return;
        }

        setAddresses(userAddresses);
        setValues((currentValues) => ({
          ...currentValues,
          fullName: user?.fullName ?? user?.name ?? currentValues.fullName,
          email: user?.email ?? currentValues.email,
          phone: user?.phone ?? currentValues.phone,
          shippingAddressId: defaultAddress?.id ?? currentValues.shippingAddressId,
          billingAddressId: defaultAddress?.id ?? currentValues.billingAddressId,
        }));
      } catch (error) {
        if (isMounted) {
          setAddressesError(
            error instanceof Error && error.message
              ? error.message
              : 'No fue posible cargar las direcciones de la cuenta.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingAddresses(false);
        }
      }
    };

    loadAddresses();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const shippingAddress = useMemo(
    () => addresses.find((address) => address.id === values.shippingAddressId) ?? null,
    [addresses, values.shippingAddressId]
  );

  const billingAddress = useMemo(
    () => addresses.find((address) => address.id === values.billingAddressId) ?? null,
    [addresses, values.billingAddressId]
  );

  const totals = useMemo(() => calculateOrderTotals(cartItems), [cartItems]);

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

    setSubmitError('');
  };

  const validateValues = () => {
    const nextErrors = {};

    if (!values.fullName.trim()) nextErrors.fullName = 'Ingresa el nombre completo.';
    if (!values.email.trim()) nextErrors.email = 'Ingresa un correo electrónico.';
    if (values.email.trim() && !EMAIL_REGEX.test(values.email.trim())) {
      nextErrors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!values.phone.trim()) nextErrors.phone = 'Ingresa un número de contacto.';
    if (!values.shippingAddressId)
      nextErrors.shippingAddressId = 'Selecciona la dirección de envío.';
    if (!values.billingAddressId)
      nextErrors.billingAddressId = 'Selecciona la dirección de facturación.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateValues();
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await onCompleteCheckout({
        customer: {
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          address: shippingAddress?.line1 ?? '',
          city: shippingAddress?.city ?? '',
          postalCode: shippingAddress?.postalCode ?? '',
        },
        billingAddress,
        billingAddressId: values.billingAddressId,
        shippingAddress,
        shippingAddressId: values.shippingAddressId,
      });

      if (order) {
        navigate('/order-confirmation');
      } else {
        navigate('/cart');
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : 'No fue posible completar la compra. Intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.emptyText}>
            No hay productos en el carrito. Regresa para agregar artículos antes de continuar.
          </p>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/cart')}
          >
            Volver al carrito
          </button>
        </div>
      </section>
    );
  }

  if (addresses.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.emptyText}>{isLoadingAddresses ? 'Cargando direcciones...' : ''}</p>
          {addressesError ? <p className={styles.emptyText}>{addressesError}</p> : null}
          <p className={styles.emptyText}>
            Antes de continuar necesitas al menos una dirección guardada en tu cuenta.
          </p>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/user/profile')}
          >
            Ir a mi cuenta
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Semana 08</p>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.subtitle}>
            Completa los datos de entrega y confirma el pedido con un flujo de compra funcional.
          </p>
        </div>

        <button type="button" className={styles.secondaryButton} onClick={() => navigate('/cart')}>
          Volver al carrito
        </button>
      </header>

      <div className={styles.layout}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Datos del cliente</h2>

            <div className={styles.fieldGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Nombre completo</span>
                <input
                  className={styles.input}
                  disabled={isSubmitting}
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  placeholder="Ejemplo: Ana Gómez"
                />
                {errors.fullName ? <span className={styles.error}>{errors.fullName}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Correo electrónico</span>
                <input
                  className={styles.input}
                  disabled={isSubmitting}
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="correo@dominio.com"
                  type="email"
                />
                {errors.email ? <span className={styles.error}>{errors.email}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Teléfono</span>
                <input
                  className={styles.input}
                  disabled={isSubmitting}
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  placeholder="3001234567"
                />
                {errors.phone ? <span className={styles.error}>{errors.phone}</span> : null}
              </label>

              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span className={styles.label}>Cart ID local</span>
                <input className={styles.input} disabled value={cart.id} readOnly />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Direcciones guardadas</h2>

            <div className={styles.addressSelectionGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Dirección de envío</span>
                <select
                  className={styles.input}
                  disabled={isSubmitting}
                  name="shippingAddressId"
                  onChange={handleChange}
                  value={values.shippingAddressId}
                >
                  <option value="">Selecciona una dirección</option>
                  {addresses.map((address) => (
                    <option key={`shipping-${address.id}`} value={address.id}>
                      {address.line1} - {address.city}
                    </option>
                  ))}
                </select>
                {errors.shippingAddressId ? (
                  <span className={styles.error}>{errors.shippingAddressId}</span>
                ) : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Dirección de facturación</span>
                <select
                  className={styles.input}
                  disabled={isSubmitting}
                  name="billingAddressId"
                  onChange={handleChange}
                  value={values.billingAddressId}
                >
                  <option value="">Selecciona una dirección</option>
                  {addresses.map((address) => (
                    <option key={`billing-${address.id}`} value={address.id}>
                      {address.line1} - {address.city}
                    </option>
                  ))}
                </select>
                {errors.billingAddressId ? (
                  <span className={styles.error}>{errors.billingAddressId}</span>
                ) : null}
              </label>
            </div>

            <div className={styles.addressPreviewGrid}>
              <article className={styles.addressPreviewCard}>
                <h3 className={styles.previewTitle}>Envío</h3>
                {shippingAddress ? (
                  <>
                    <p>{shippingAddress.line1}</p>
                    {shippingAddress.line2 ? <p>{shippingAddress.line2}</p> : null}
                    <p>
                      {shippingAddress.city}, {shippingAddress.state}
                    </p>
                    <p>
                      {shippingAddress.country} - {shippingAddress.postalCode}
                    </p>
                  </>
                ) : (
                  <p>Selecciona una dirección.</p>
                )}
              </article>

              <article className={styles.addressPreviewCard}>
                <h3 className={styles.previewTitle}>Facturación</h3>
                {billingAddress ? (
                  <>
                    <p>{billingAddress.line1}</p>
                    {billingAddress.line2 ? <p>{billingAddress.line2}</p> : null}
                    <p>
                      {billingAddress.city}, {billingAddress.state}
                    </p>
                    <p>
                      {billingAddress.country} - {billingAddress.postalCode}
                    </p>
                  </>
                ) : (
                  <p>Selecciona una dirección.</p>
                )}
              </article>
            </div>
          </section>
          {submitError ? <p className={styles.error}>{submitError}</p> : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={isSubmitting}
              onClick={() => navigate('/cart')}
            >
              Volver
            </button>
            <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
              {isSubmitting ? 'Procesando compra...' : 'Confirmar compra'}
            </button>
          </div>
        </form>

        <aside className={styles.summaryCard}>
          <h2 className={styles.sectionTitle}>Resumen del pedido</h2>

          <div className={styles.summaryList}>
            {cartItems.map((item) => (
              <article key={item.id} className={styles.summaryItem}>
                <OptionalImage className={styles.summaryImage} src={item.image} alt={item.name} />
                <div>
                  <h3 className={styles.summaryName}>{item.name}</h3>
                  <p className={styles.summaryMeta}>
                    {item.quantity} x {formatCOP(item.price)}
                  </p>
                </div>
                <strong className={styles.summaryPrice}>
                  {formatCOP(item.price * item.quantity)}
                </strong>
              </article>
            ))}
          </div>

          <div className={styles.totalRows}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <strong>{formatCOP(totals.subtotal)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>IVA (19%)</span>
              <strong>{formatCOP(totals.tax)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>Envío</span>
              <strong>{formatCOP(totals.shipping)}</strong>
            </div>
            <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
              <span>Total</span>
              <strong>{formatCOP(totals.total)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;
