import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { products as seedProducts } from '../data/Product.js';
import productService from '../services/productService';
import homeStyles from '../styles/Home.module.css';

function Home() {
  // Siempre arranca con tus 4 productos locales
  const [productsState, setProductsState] = useState(seedProducts);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    productService
      .getProductsAsync()
      .then((backendProducts) => {
        if (!isMounted) return;
        if (!Array.isArray(backendProducts) || backendProducts.length === 0) return;

        // Une los productos del backend con los tuyos locales.
        // Si un producto del backend tiene el mismo id que uno local, gana el del backend.
        // Si no, se agregan al final.
        setProductsState((currentProducts) => {
          const localIds = new Set(currentProducts.map((p) => p.id));
          const onlyFromBackend = backendProducts.filter((p) => !localIds.has(p.id));
          return [...currentProducts, ...onlyFromBackend];
        });
      })
      .catch(() => {
        // Backend caído — los productos locales ya están, no pasa nada
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryTiles = useMemo(() => {
    const bestByCategory = new Map();

    for (const product of productsState) {
      const category = product.category ?? product.categoryName ?? 'Sin categoría';
      const rating = Number(product.rating);
      const current = bestByCategory.get(category);

      if (!current) {
        bestByCategory.set(category, { product, rating });
        continue;
      }

      const isBetter =
        (Number.isFinite(rating) ? rating : 0) >
        (Number.isFinite(Number(current.rating)) ? Number(current.rating) : 0);

      if (isBetter) bestByCategory.set(category, { product, rating });
    }

    return Array.from(bestByCategory.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, data]) => ({ category, product: data.product }));
  }, [productsState]);

  return (
    <div className={homeStyles.container}>
      <header className={homeStyles.header}>
        <h1 className={homeStyles.title}>Inicio</h1>
        <p className={homeStyles.subtitle}>Selecciona una categoría para ver sus productos</p>
      </header>

      <div className={homeStyles.categoryGrid}>
        {categoryTiles.map(({ category, product }) => (
          <button
            key={category}
            type="button"
            className={homeStyles.categoryTile}
            onClick={() => navigate(`/category/${encodeURIComponent(category)}`)}
            aria-label={`Ver productos de ${category}`}
          >
            <img
              className={homeStyles.categoryImage}
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80';
              }}
            />
            <div className={homeStyles.categoryLabel}>
              <span className={homeStyles.categoryLabelText}>{category}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;