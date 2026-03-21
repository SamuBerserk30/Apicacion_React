import { useLocation, useNavigate } from 'react-router-dom';
import styles from "../styles/Navbar.module.css";

import logo from "../assets/react.svg";

function Navbar({ onNavigate, user, onSignIn, onSignOut }) {
  const userLabel = user?.name ?? "Invitado";
  const isLoggedIn = Boolean(user);
  const Navigate = useNavigate();
  const location = useLocation();

  const isHomeActive = location.pathname === "/" || location.pathname.startsWith('/category')
  const isProductsActive = location.pathname === "/products";
  const isCartActive =
    location.pathname === "/Cart" ||
    location.pathname === "/checkout" ||
    location.pathname === "/order-confirmation";

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <img className={styles.logo} src={logo} alt="Logo" />
        <span className={styles.brandName}>Sistema Ventas</span>
      </div>

      <div className={styles.links}>
        <button
          type="button"
          className={`${styles.link} ${isHomeActive ? styles.active : ""}`}
          onClick={() => Navigate("home")}
        >
          Inicio
        </button>
        <button
          type="button"
          className={`${styles.link} ${isProductsActive ? styles.active : ""}`}
          onClick={() => Navigate("products")}
        >
          Productos
        </button>
        <button
          type="button"
          className={`${styles.link} ${isCartActive ? styles.active : ""}`}
          onClick={() => Navigate("cart")}
        >
          Carrito
        </button>
      </div>

      <div className={styles.auth}>
        <span className={styles.userName}>{userLabel}</span>

        {isLoggedIn ? (
          <button type="button" className={styles.authBtn} onClick={onSignOut}>
            Sign out
          </button>
        ) : (
          <button type="button" className={styles.authBtn} onClick={onSignIn}>
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;