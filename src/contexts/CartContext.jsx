import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { appConfig } from '../config';
import cartService from '../services/cartService';
import { CART_STORAGE_KEY, CART_UPDATED_EVENT } from '../utils/cartStorage';

import { AuthContext } from './AuthContext';

const CartContext = createContext(null);
const EMPTY_CART_ITEMS = [];

function CartProvider({ children }) {
  const { currentUser, isHydratingSession } = useContext(AuthContext);
  const [cart, setCart] = useState(() => cartService.getCart());
  const [cartError, setCartError] = useState('');
  const [isSyncingCart, setIsSyncingCart] = useState(false);
  const [cartHydrationStatus, setCartHydrationStatus] = useState(() =>
    appConfig.useRemoteApi ? 'idle' : 'ready'
  );

  useEffect(() => {
    let isMounted = true;

    const syncCartFromStorage = () => {
      if (!isMounted) {
        return;
      }

      setCart(cartService.getCart());
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === CART_STORAGE_KEY) {
        syncCartFromStorage();
      }
    };

    syncCartFromStorage();
    window.addEventListener('storage', handleStorage);
    window.addEventListener(CART_UPDATED_EVENT, syncCartFromStorage);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CART_UPDATED_EVENT, syncCartFromStorage);
    };
  }, []);

  useEffect(() => {
    if (!appConfig.useRemoteApi) {
      setCartHydrationStatus('ready');
      return;
    }

    if (isHydratingSession) {
      return;
    }

    let isMounted = true;

    const hydrateRemoteCart = async () => {
      setIsSyncingCart(true);
      setCartHydrationStatus('hydrating');

      try {
        const nextCart = await cartService.getCartAsync();

        if (!isMounted) {
          return;
        }

        setCart(nextCart);
        setCartError('');
        setCartHydrationStatus('ready');
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCartError(
          error instanceof Error && error.message
            ? error.message
            : 'No fue posible sincronizar el carrito.'
        );
        setCartHydrationStatus('error');
      } finally {
        if (isMounted) {
          setIsSyncingCart(false);
        }
      }
    };

    hydrateRemoteCart();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, isHydratingSession]);

  const cartItems = cart.items ?? EMPTY_CART_ITEMS;

  const runCartAction = async (action) => {
    setIsSyncingCart(true);
    setCartError('');

    try {
      const nextCart = await action();
      setCart(nextCart ?? cartService.getCart());
    } catch (error) {
      setCartError(
        error instanceof Error && error.message
          ? error.message
          : 'No fue posible actualizar el carrito.'
      );
    } finally {
      setIsSyncingCart(false);
    }
  };

  const addToCart = (product) => {
    return runCartAction(() => cartService.addToCartAsync(product, cartItems));
  };

  const updateCartItemQuantity = (productId, nextQuantity) => {
    return runCartAction(() =>
      cartService.updateCartItemQuantityAsync(productId, nextQuantity, cartItems)
    );
  };

  const removeCartItem = (productId) => {
    return runCartAction(() => cartService.removeCartItemAsync(productId, cartItems));
  };

  const clearCart = () => {
    return runCartAction(() => cartService.clearCartAsync());
  };

  const cartItemCount = useMemo(() => cartService.getCartItemCount(cartItems), [cartItems]);

  const refreshCart = () => runCartAction(() => cartService.getCartAsync());

  const value = {
    addToCart,
    cart,
    cartError,
    cartHydrationStatus,
    cartItemCount,
    cartItems,
    clearCart,
    isCartReady: cartHydrationStatus === 'ready',
    isSyncingCart,
    removeCartItem,
    refreshCart,
    updateCartItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export { CartContext, CartProvider };
