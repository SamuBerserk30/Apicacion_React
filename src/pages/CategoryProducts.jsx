import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { products as seedProducts } from '../data/Products.js';
import productService from '../services/productService';
import styles from '../styles/CategoryProducts.module.css';
import productListStyles from './ProductList.module.css';

function CategoryProducts({ cartItems, onAddToCart }) {
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productsState, setProductsState] = useState(seedProducts);
  const navigate = useNavigate();
  const { categoryName } = useParams();

  useEffect(() => {
    let isMounted = true;
    productService
      .getProductsAsync()
      .then((backendProducts) => {
        if (!isMounted) return;
        if (!Array.isArray(backendProducts) || backendProducts.length === 0) return;
        setProductsState((current) => {
          const localIds = new Set(current.map((p) => p.id));
          const onlyFromBackend = backendProducts.filter((p) => !localIds.has(p.id));
          return [...current, ...onlyFromBackend];
        });
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const category = useMemo(
    () => (categoryName ? decodeURIComponent(categoryName) : null),
    [categoryName]
  );

  const cartQuantityByProductId = useMemo(
    () => new Map((cartItems ?? []).map((item) => [item.id, item.quantity])),
    [cartItems]
  );

  const filteredProducts = useMemo(() => {
    if (!category) return [];
    const q = query.trim().toLowerCase();
    return productsState.filter((product) => {
      const productCategory = product.category ?? product.categoryName ?? '';
      if (productCategory !== category) return false;
      if (!q) return true;
      return String(product.name ?? '').toLowerCase().includes(q);
    });
  }, [category, productsState, query]);

  const handleOpenDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.btnBack} onClick={() => navigate(-1)}>
          Volver
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{category ?? 'Categoría'}</h1>
          <p className={styles.subtitle}>Filtra por nombre para encontrar un producto</p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <input
          className={styles.input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre..."
        />
      </div>

      {!category ? (
        <p className={styles.empty}>Selecciona una categoría desde Inicio.</p>
      ) : filteredProducts.length === 0 ? (
        <p className={styles.empty}>No hay productos para mostrar.</p>
      ) : (
        <div className={productListStyles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category ?? product.categoryName}
              rating={product.rating}
              price={product.price}
              stock={product.stock ?? product.stockQty}
              image={product.image}
              description={product.description}
              onAddToCart={onAddToCart}
              disableAddToCart={(cartQuantityByProductId.get(product.id) ?? 0) >= (product.stock ?? product.stockQty ?? 0)}
              onDetails={() => handleOpenDetails(product)}
            />
          ))}
        </div>
      )}

      <ProductDetailsModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={handleCloseDetails}
      />
    </section>
  );
}

export default CategoryProducts;