import { useEffect, useState } from 'react';

import styles from '../styles/UserProfile.module.css';

const emptyValues = {
  type: 'SHIPPING',
  line1: '',
  line2: '',
  city: '',
  state: '',
  country: 'Colombia',
  postalCode: '',
  isDefault: false,
};

function AddressForm({
  initialValues,
  isSubmitting = false,
  onCancel,
  onSubmit,
  submitError = '',
}) {
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues({
      ...emptyValues,
      ...initialValues,
      isDefault: Boolean(initialValues?.isDefault),
    });
    setErrors({});
  }, [initialValues]);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
  };

  const validateValues = () => {
    const nextErrors = {};

    if (!values.line1.trim()) nextErrors.line1 = 'Ingresa la línea principal de la dirección.';
    if (!values.city.trim()) nextErrors.city = 'Ingresa la ciudad.';
    if (!values.state.trim()) nextErrors.state = 'Ingresa el departamento o estado.';
    if (!values.country.trim()) nextErrors.country = 'Ingresa el país.';
    if (!values.postalCode.trim()) nextErrors.postalCode = 'Ingresa el código postal.';

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateValues();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      ...initialValues,
      type: values.type,
      line1: values.line1.trim(),
      line2: values.line2.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      country: values.country.trim(),
      postalCode: values.postalCode.trim(),
      isDefault: values.isDefault,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Tipo de dirección</span>
          <select
            className={styles.input}
            disabled={isSubmitting}
            name="type"
            onChange={handleChange}
            value={values.type}
          >
            <option value="SHIPPING">Envío</option>
            <option value="BILLING">Facturación</option>
          </select>
        </label>

        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className={styles.label}>Dirección principal</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="line1"
            onChange={handleChange}
            placeholder="Calle 10 #20-30"
            value={values.line1}
          />
          {errors.line1 ? <span className={styles.error}>{errors.line1}</span> : null}
        </label>

        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className={styles.label}>Complemento</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="line2"
            onChange={handleChange}
            placeholder="Apartamento, torre, oficina..."
            value={values.line2}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Ciudad</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="city"
            onChange={handleChange}
            placeholder="Medellín"
            value={values.city}
          />
          {errors.city ? <span className={styles.error}>{errors.city}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Departamento o estado</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="state"
            onChange={handleChange}
            placeholder="Antioquia"
            value={values.state}
          />
          {errors.state ? <span className={styles.error}>{errors.state}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>País</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="country"
            onChange={handleChange}
            placeholder="Colombia"
            value={values.country}
          />
          {errors.country ? <span className={styles.error}>{errors.country}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Código postal</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="postalCode"
            onChange={handleChange}
            placeholder="050021"
            value={values.postalCode}
          />
          {errors.postalCode ? <span className={styles.error}>{errors.postalCode}</span> : null}
        </label>

        <label className={`${styles.field} ${styles.checkboxField} ${styles.fieldWide}`}>
          <input
            checked={values.isDefault}
            disabled={isSubmitting}
            name="isDefault"
            onChange={handleChange}
            type="checkbox"
          />
          <span className={styles.helper}>Usar esta dirección como predeterminada.</span>
        </label>
      </div>

      {submitError ? <p className={styles.errorBanner}>{submitError}</p> : null}

      <div className={styles.formActions}>
        <button
          className={styles.secondaryButton}
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
        <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Guardando dirección...' : 'Guardar dirección'}
        </button>
      </div>
    </form>
  );
}

export default AddressForm;
