import { useEffect, useRef, useState } from 'react';

import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import ProductForm from '../components/ProductForm';
import { products as seedProducts } from '../data/Products.js';
import productService from '../services/productService';
import styles from '../styles/ProductList.module.css';
import useAuth from '../hooks/useAuth';

function ProductList() {
  const [productsState, setProductsState] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const seededRef = useRef(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const loadAndSeed = async () => {
      try {
        // 1. Cargar productos del backend
        const backendProducts = await productService.getProductsAsync();

        if (!isMounted) return;

        if (Array.isArray(backendProducts) && backendProducts.length > 0) {
          // Si hay productos en el backend, combinarlos con los locales sin duplicar
          setProductsState((current) => {
            const localIds = new Set(current.map((p) => p.id));
            const onlyFromBackend = backendProducts.filter((p) => !localIds.has(p.id));
            return [...current, ...onlyFromBackend];
          });
        } else if (!seededRef.current) {
          // Si NO hay productos en el backend, insertar los locales
          seededRef.current = true;
          await seedLocalProducts();
          const afterSeed = await productService.getProductsAsync();
          if (isMounted && Array.isArray(afterSeed) && afterSeed.length > 0) {
            setProductsState((current) => {
              const localIds = new Set(seedProducts.map((p) => p.id));
              const fromBackend = afterSeed.filter((p) => !localIds.has(p.id));
              return [...seedProducts, ...fromBackend];
            });
          }
        }
      } catch {
        // Backend no disponible - quedan los productos locales
      }
    };

    loadAndSeed();
    return () => { isMounted = false; };
  }, []);

  // Inserta los productos locales en el backend
  const seedLocalProducts = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    // Obtener categorías del backend
    const catRes = await fetch('/api/v1/categories', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!catRes.ok) return;
    const categories = await catRes.json().catch(() => []);
    const catList = Array.isArray(categories) ? categories : categories?.items ?? [];

    for (const product of seedProducts) {
      const foundCat = catList.find(
        (c) => String(c.name ?? '').toLowerCase() === String(product.category ?? '').toLowerCase()
      );
      if (!foundCat) continue;

      const sku = product.name.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 20);

      await fetch('/api/v1/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: foundCat.id,
          sku,
          name: product.name,
          description: product.description ?? '',
          image: product.image ?? '',
          price: product.price,
          stockQty: product.stock ?? 5,
          isActive: true,
        }),
      }).catch(() => {});
    }
  };

  const refreshProducts = async () => {
    try {
      const backendProducts = await productService.getProductsAsync();
      if (!Array.isArray(backendProducts)) return;
      setProductsState(() => {
        const localIds = new Set(seedProducts.map((p) => p.id));
        const fromBackend = backendProducts.filter((p) => !localIds.has(p.id));
        return [...seedProducts, ...fromBackend];
      });
    } catch { }
  };

  const handleOpenCreate = () => { setEditingProduct(null); setIsFormOpen(true); };
  const handleCloseForm = () => { setEditingProduct(null); setIsFormOpen(false); };

  const handleAddProduct = async (product) => {
    await productService.createProductAsync(product, productsState);
    handleCloseForm();
    refreshProducts();
  };

  const handleDeleteProduct = async (id) => {
    await productService.deleteProductAsync(id, productsState);
    if (editingProduct?.id === id) handleCloseForm();
    refreshProducts();
  };

  const handleEditStart = (product) => { setEditingProduct(product); setIsFormOpen(true); };

  const handleEditSubmit = async (updatedProduct) => {
    await productService.updateProductAsync(updatedProduct, productsState);
    handleCloseForm();
    refreshProducts();
  };

  const handleOpenDetails = (product) => { setSelectedProduct(product); setIsModalOpen(true); };
  const handleCloseDetails = () => { setIsModalOpen(false); setSelectedProduct(null); };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Productos Informáticos</h1>
        <p className={styles.subtitle}>
          Encuentra los mejores productos de tecnología para tu setup
        </p>
      </header>

      {isFormOpen ? (
        <ProductForm
          initialValues={editingProduct}
          isEditing={Boolean(editingProduct)}
          onCancel={handleCloseForm}
          onSubmit={editingProduct ? handleEditSubmit : handleAddProduct}
        />
      ) : (
        <>
          <div className={styles.toolbar}>
           {isAdmin ? (
            <button className={styles.btnAdd} type="button" onClick={handleOpenCreate}>
                Agregar producto
            </button>
           ) : null}
          </div>

          <div className={styles.grid}>
            {productsState.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                category={product.category ?? product.categoryName}
                price={product.price}
                rating={product.rating}
                stock={product.stock ?? product.stockQty}
                image={product.image}
                description={product.description}
                onDelete={isAdmin ? () => handleDeleteProduct(product.id) : undefined}
                onEdit={isAdmin ? () => handleEditStart(product) : undefined}
                onClick={() => handleOpenDetails(product)}
              />
            ))}
          </div>

          <ProductDetailsModal
            isOpen={isModalOpen}
            product={selectedProduct}
            onClose={handleCloseDetails}
          />
        </>
      )}
    </div>
  );
}

export default ProductList;