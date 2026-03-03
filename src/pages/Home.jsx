import { useMemo, useState } from 'react';

import homeStyles from '../styles/Home.module.css';
import { loadProducts } from '../utils/productsStorage';

function Home({ onOpenCategory }) {
  const [productsState] = useState(loadProducts);

  const categoryTiles = useMemo(() => {
    const bestByCategory = new Map();

    for (const product of productsState) {
      const category = product.category ?? 'Sin categoría';
      const rating = Number(product.rating);
      const current = bestByCategory.get(category);

      if (!current) {
        bestByCategory.set(category, { product, rating });
        continue;
      }

      const currentRating = Number(current.rating);
      const isBetter =
        (Number.isFinite(rating) ? rating : 0) >
        (Number.isFinite(currentRating) ? currentRating : 0);

      if (isBetter) {
        bestByCategory.set(category, { product, rating });
      }
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
            onClick={() => onOpenCategory?.(category)}
            aria-label={`Ver productos de ${category}`}
          >
            <img className={homeStyles.categoryImage} src={product.image} alt={product.name} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;