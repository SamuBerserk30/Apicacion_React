import { useEffect, useState } from 'react';

import styles from '../styles/UserProfile.module.css';

const emptyValues = {
  firstName: '',
  lastName: '',
  phone: '',
};

function UserProfileForm({
  initialValues,
  email,
  roleLabel,
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitError = '',
}) {
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues({
      firstName: initialValues?.firstName ?? '',
      lastName: initialValues?.lastName ?? '',
      phone: initialValues?.phone ?? '',
    });
    setErrors({});
  }, [initialValues]);

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

    if (!values.firstName.trim()) {
      nextErrors.firstName = 'Ingresa el nombre para el perfil.';
    }

    if (!values.lastName.trim()) {
      nextErrors.lastName = 'Ingresa el apellido para el perfil.';
    }

    if (values.phone.trim() && values.phone.trim().length < 7) {
      nextErrors.phone = 'Ingresa un teléfono válido o déjalo vacío.';
    }

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
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Nombre</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="firstName"
            onChange={handleChange}
            placeholder="Ejemplo: Ana"
            value={values.firstName}
          />
          {errors.firstName ? <span className={styles.error}>{errors.firstName}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Apellido</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="lastName"
            onChange={handleChange}
            placeholder="Ejemplo: Gómez"
            value={values.lastName}
          />
          {errors.lastName ? <span className={styles.error}>{errors.lastName}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Correo</span>
          <input className={styles.input} disabled readOnly value={email} />
          <span className={styles.helper}>
            El correo es el identificador de acceso y no se edita aquí.
          </span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Rol</span>
          <input className={styles.input} disabled readOnly value={roleLabel} />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Teléfono</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="phone"
            onChange={handleChange}
            placeholder="3001234567"
            value={values.phone}
          />
          {errors.phone ? <span className={styles.error}>{errors.phone}</span> : null}
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
          {isSubmitting ? 'Guardando perfil...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

export default UserProfileForm;
