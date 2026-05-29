import { useLocation, useNavigate } from 'react-router-dom';

import styles from '../styles/Unauthorized.module.css';

function Unauthorized() {
  const location = useLocation();
  const navigate = useNavigate();
  const blockedPath = location.state?.from ?? '/admin';

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Semana 12</p>
        <h1 className={styles.title}>Acceso denegado</h1>
        <p className={styles.subtitle}>
          Tu sesión está activa, pero no tiene permisos para abrir <strong>{blockedPath}</strong>.
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={() => navigate('/')}>
            Volver al inicio
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/user/profile')}
          >
            Ir a mi cuenta
          </button>
        </div>
      </div>
    </section>
  );
}

export default Unauthorized;
