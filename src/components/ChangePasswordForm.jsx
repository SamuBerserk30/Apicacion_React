import { useState } from 'react';

import styles from '../styles/UserProfile.module.css';

function ChangePasswordForm({
  onSubmit,
  isSubmitting = false,
  submitError = '',
  submitSuccess = '',
}) {
  const [values, setValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

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

    if (!values.currentPassword) {
      nextErrors.currentPassword = 'Ingresa la contraseña actual.';
    }

    if (!values.newPassword || values.newPassword.length < 8) {
      nextErrors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres.';
    }

    if (
      values.newPassword &&
      values.currentPassword &&
      values.newPassword === values.currentPassword
    ) {
      nextErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual.';
    }

    if (values.confirmPassword !== values.newPassword) {
      nextErrors.confirmPassword = 'La confirmación no coincide con la nueva contraseña.';
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

    const result = await onSubmit({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });

    if (result?.ok) {
      setValues({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGridSingle}>
        <label className={styles.field}>
          <span className={styles.label}>Contraseña actual</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="currentPassword"
            onChange={handleChange}
            placeholder="Ingresa tu contraseña actual"
            type="password"
            value={values.currentPassword}
          />
          {errors.currentPassword ? (
            <span className={styles.error}>{errors.currentPassword}</span>
          ) : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Nueva contraseña</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="newPassword"
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
            type="password"
            value={values.newPassword}
          />
          {errors.newPassword ? <span className={styles.error}>{errors.newPassword}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Confirmar nueva contraseña</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="confirmPassword"
            onChange={handleChange}
            placeholder="Repite la nueva contraseña"
            type="password"
            value={values.confirmPassword}
          />
          {errors.confirmPassword ? (
            <span className={styles.error}>{errors.confirmPassword}</span>
          ) : null}
        </label>
      </div>

      {submitError ? <p className={styles.errorBanner}>{submitError}</p> : null}
      {submitSuccess ? <p className={styles.successBanner}>{submitSuccess}</p> : null}

      <div className={styles.formActions}>
        <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Actualizando contraseña...' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  );
}

export default ChangePasswordForm;
