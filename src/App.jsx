import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom'

import Footer from './components/Footer';
import Header from './components/Header';
import Cart from './pages/Cart';
//import Checkout from '.pages/Checkout';
import CategoryProducts from './pages/CategoryProducts';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import { CART_STORAGE_KEY, loadCartItems } from './utils/cartStorage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState(loadCartItems);
  const [latestOrder, setLatestOrder] = useState(null);
  
  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product) => {
    if (!product || !Number.isFinite(Number(product.id))) {
      return;
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);
      const stock =
        Number.isFinite(Number(product.stock)) && Number(product.stock) > 0
          ? Number(product.stock)
          : 1;

      if (!existingItem) {
        return [
          ...currentItems,
          {
            id: Number(product.id),
            name: product.name,
            category: product.category,
            price: Number(product.price) || 0,
            stock,
            image: product.image,
            quantity: 1,
          },
        ];
      }

      return currentItems.map((item) => {
        if (item.id !== product.id) {
          return item;
        }

        return {
          ...item,
          stock,
          quantity: Math.min(item.quantity + 1, stock),
        };
      });
    });
  };

  const handleUpdateCartItemQuantity = (productId, nextQuantity) => {
    setCartItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.id !== productId) {
          return [item];
        }

        const stock =
          Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 ? Number(item.stock) : 1;
        const normalizedQuantity = Math.max(
          1,
          Math.min(stock, Math.floor(Number(nextQuantity) || 1))
        );

        return normalizedQuantity > 0 ? [{ ...item, quantity: normalizedQuantity }] : [];
      })
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSignIn = () => {
  setUser({ name: 'Usuario' });
  };

const handleSignOut = () => {
  setUser(null);
  };
  
  return (
    <div className="app">
      <Header
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <main className="main">
       <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryName" element={<CategoryProducts cartItems={cartItems} onAddToCart={handleAddToCart}/>} /> 
        <Route path="/products" element={<ProductList />} />
        <Route path="*" element={<Navigate to="/" replace />} />
       </Routes>
       </main>
      <Footer />
    </div>
  );
}

export default App;