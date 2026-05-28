import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import styles from '../styles/AuthPage.module.css';

function Register() {
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!values.firstName.trim()) {
      setError('Ingresa tu nombre.');
      return;
    }
    if (!values.lastName.trim()) {
      setError('Ingresa tu apellido.');
      return;
    }
    if (values.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (values.phone.trim() && !/^[+]?[0-9]{6,15}$/.test(values.phone.trim())) {
  setError('El teléfono debe tener entre 6 y 15 dígitos.');
  return;
}

    setIsLoading(true);

    const result = await register({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      password: values.password,
      phone: values.phone.trim() || undefined,
    });

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error ?? 'No fue posible crear la cuenta.');
      return;
    }

    navigate('/user/profile', { replace: true });
  };

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Usuario</p>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>
          Registra un usuario para mantener sesión y asociar compras a tu perfil.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Nombre</span>
            <input
              className={styles.input}
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              placeholder="Ejemplo: Ana"
              disabled={isLoading}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Apellido</span>
            <input
              className={styles.input}
              name="lastName"
              value={values.lastName}
              onChange={handleChange}
              placeholder="Ejemplo: Gómez"
              disabled={isLoading}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Correo electrónico</span>
            <input
              className={styles.input}
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="correo@dominio.com"
              type="email"
              disabled={isLoading}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Teléfono (opcional)</span>
            <input
              className={styles.input}
              name="phone"
              value={values.phone}
              onChange={handleChange}
              placeholder="3001234567"
              type="tel"
              disabled={isLoading}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Contraseña</span>
            <input
              className={styles.input}
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              type="password"
              disabled={isLoading}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Confirmar contraseña</span>
            <input
              className={styles.input}
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              type="password"
              disabled={isLoading}
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.primaryButton} disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className={styles.helperText}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>.
        </p>
      </div>
    </section>
  );
}

export default Register;