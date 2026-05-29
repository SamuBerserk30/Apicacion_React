import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import useCart from '../hooks/useCart';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import styles from '../styles/CategoryProducts.module.css';
import productListStyles from '../styles/ProductList.module.css';


function CategoryProducts() {
  const { addToCart, cartItems } = useCart();
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productsState, setProductsState] = useState([]);
  const [resolvedCategory, setResolvedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();
  const { categoryName } = useParams();

  const category = useMemo(
    () => (categoryName ? decodeURIComponent(categoryName) : null),
    [categoryName]
  );

  useEffect(() => {
    let isMounted = true;

    const loadCategoryProducts = async () => {
      if (!category) {
        setProductsState([]);
        setResolvedCategory(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError('');

      try {
        const categories = await categoryService.getCategoriesAsync();
        const normalizedCategory = category.trim().toLowerCase();
        const nextCategory =
          categories.find(
            (item) =>
              String(item.slug ?? '')
                .trim()
                .toLowerCase() === normalizedCategory ||
              String(item.name ?? '')
                .trim()
                .toLowerCase() === normalizedCategory
          ) ?? null;
        const nextProducts = await productService.getProductsAsync({
          activeOnly: true,
          ...(nextCategory?.id ? { categoryId: nextCategory.id } : { categoryName: category }),
        });

        if (isMounted) {
          setResolvedCategory(nextCategory);
          setProductsState(nextProducts);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error && error.message
              ? error.message
              : 'No fue posible cargar los productos de la categoría.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCategoryProducts();

    return () => {
      isMounted = false;
    };
  }, [category]);

  const cartQuantityByProductId = useMemo(
    () => new Map(cartItems.map((item) => [item.id, item.quantity])),
    [cartItems]
  );

  const filteredProducts = useMemo(() => {
    if (!category) return [];

    const q = query.trim().toLowerCase();

    return productsState.filter((product) => {
      if (product.isActive === false) return false;
      if (!q) return true;

      return String(product.name ?? '')
        .toLowerCase()
        .includes(q);
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
        <button type="button" className={styles.btnBack} onClick={() => navigate('/')}>
          Volver
        </button>

        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{resolvedCategory?.name ?? category ?? 'Categoría'}</h1>
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
      ) : isLoading ? (
        <p className={styles.empty}>Cargando productos de la categoría...</p>
      ) : loadError ? (
        <p className={styles.empty}>{loadError}</p>
      ) : filteredProducts.length === 0 ? (
        <p className={styles.empty}>No hay productos para mostrar.</p>
      ) : (
        <div className={productListStyles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              categoryName={product.categoryName}
              rating={product.rating}
              price={product.price}
              stock={product.stock}
              stockQty={product.stockQty}
              isActive={product.isActive}
              isAvailable={product.isAvailable}
              image={product.image}
              description={product.description}
              onAddToCart={addToCart}
              disableAddToCart={(cartQuantityByProductId.get(product.id) ?? 0) >= product.stockQty}
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