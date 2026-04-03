import { useLocation, useNavigate } from 'react-router-dom';
import styles from "../styles/Navbar.module.css";

import logo from "../assets/react.svg";

function Navbar({ onNavigate, user, onSignIn, onSignOut, cartItemCount = 0 }) {
  const userLabel = user?.name ?? "Invitado";
  const isLoggedIn = Boolean(user);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomeActive = location.pathname === "/" || location.pathname.startsWith('/category')
  const isProductsActive = location.pathname === "/products";
  const isCartActive =
    location.pathname === "/cart" ||
    location.pathname === "/checkout" ||
    location.pathname === "/order-confirmation";
    const isAccountActive = location.pathname.startsWith('/user');
    
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
          onClick={() => navigate("/")}
        >
          Inicio
        </button>
        <button
          type="button"
          className={`${styles.link} ${isProductsActive ? styles.active : ""}`}
          onClick={() => navigate("/products")}
        >
          Productos
        </button>
        <button
          type="button"
          className={`${styles.link} ${isCartActive ? styles.active : ""}`}
          onClick={() => navigate("/cart")}
        >
          Carrito
         {cartItemCount > 0 ? <span className={styles.cartBadge}>{cartItemCount}</span> : null}
        </button>
                <button
          type="button"
          className={`${styles.link} ${isAccountActive ? styles.active : ''}`}
          onClick={() => navigate('/user/profile')}
        >
          Mi cuenta
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