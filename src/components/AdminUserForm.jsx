import { useEffect, useState } from 'react';

import styles from '../styles/ProductForm.module.css';

const emptyValues = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: 'CUSTOMER',
  status: 'ACTIVE',
  password: '',
  confirmPassword: '',
};

const EMAIL_REGEX = /^[^@]+@[^@]+\.[^@]+$/;

function AdminUserForm({
  initialValues,
  onSubmit,
  onCancel,
  isEditing = false,
  isSubmitting = false,
  submitError = '',
}) {
  const [values, setValues] = useState(emptyValues);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialValues) {
      setValues({
        email: initialValues.email ?? '',
        firstName: initialValues.firstName ?? '',
        lastName: initialValues.lastName ?? '',
        phone: initialValues.phone ?? '',
        role: initialValues.role ?? 'CUSTOMER',
        status: initialValues.status ?? 'ACTIVE',
        password: '',
        confirmPassword: '',
      });
      setFormError('');
      return;
    }

    setValues(emptyValues);
    setFormError('');
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    if (formError) {
      setFormError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      email: values.email.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      role: values.role,
      status: values.status,
    };

    if (!payload.firstName) {
      setFormError('El nombre es obligatorio.');
      return;
    }

    if (!payload.lastName) {
      setFormError('El apellido es obligatorio.');
      return;
    }

    if (!payload.email || !EMAIL_REGEX.test(payload.email)) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }

    if (!isEditing) {
      if (!values.password || values.password.length < 6) {
        setFormError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      if (values.password !== values.confirmPassword) {
        setFormError('Las contraseñas no coinciden.');
        return;
      }

      payload.password = values.password;
    }

    const result = await onSubmit(payload);

    if (!result?.ok) {
      setFormError(result?.error ?? 'No fue posible guardar el usuario.');
    }
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>{isEditing ? 'Editar usuario' : 'Crear usuario'}</h2>
        <p className={styles.subtitle}>
          {isEditing
            ? 'Actualiza datos de cuenta, rol y estado para el usuario seleccionado.'
            : 'Crea un usuario administrador o cliente con el contrato del backend actual.'}
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>Nombre</span>
            <input
              className={styles.input}
              disabled={isSubmitting}
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              placeholder="Ada"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Apellido</span>
            <input
              className={styles.input}
              disabled={isSubmitting}
              name="lastName"
              value={values.lastName}
              onChange={handleChange}
              placeholder="Lovelace"
            />
          </label>
        </div>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>Correo</span>
            <input
              className={styles.input}
              disabled={isSubmitting}
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder="ada@cesde.edu.co"
            />
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
          </label>
        </div>

        {!isEditing ? (
          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Contraseña</span>
              <input
                className={styles.input}
                disabled={isSubmitting}
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Minimo 6 caracteres"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Confirmar contraseña</span>
              <input
                className={styles.input}
                disabled={isSubmitting}
                name="confirmPassword"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                placeholder="Repite la contraseña"
              />
            </label>
          </div>
        ) : null}

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>Rol</span>
            <select
              className={styles.input}
              disabled={isSubmitting}
              name="role"
              value={values.role}
              onChange={handleChange}
            >
              <option value="CUSTOMER">Cliente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Estado</span>
            <select
              className={styles.input}
              disabled={isSubmitting}
              name="status"
              value={values.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </label>
        </div>

        {formError || submitError ? (
          <p className={styles.error}>{formError || submitError}</p>
        ) : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnSecondary}
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button className={styles.btnPrimary} type="submit" disabled={isSubmitting}>
            {isEditing ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AdminUserForm;
