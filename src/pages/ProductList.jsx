import { useEffect, useState } from 'react';

import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import ProductForm from '../components/ProductForm';
import { products as seedProducts } from '../data/Product.js';
import productService from '../services/productService';
import styles from './ProductList.module.css';

function ProductList() {

  const [productsState, setProductsState] = useState(seedProducts);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    productService
      .getProductsAsync()
      .then((backendProducts) => {
        if (!isMounted) return;
        if (!Array.isArray(backendProducts) || backendProducts.length === 0) return;

        // Une locales + backend sin duplicar por id
        setProductsState((currentProducts) => {
          const localIds = new Set(currentProducts.map((p) => p.id));
          const onlyFromBackend = backendProducts.filter((p) => !localIds.has(p.id));
          return [...currentProducts, ...onlyFromBackend];
        });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshProducts = () => {
    productService
      .getProductsAsync()
      .then((backendProducts) => {
        if (!Array.isArray(backendProducts) || backendProducts.length === 0) return;
        setProductsState((currentProducts) => {
          const localIds = new Set(seedProducts.map((p) => p.id));
          const onlyFromBackend = backendProducts.filter((p) => !localIds.has(p.id));
          return [...seedProducts, ...onlyFromBackend];
        });
      })
      .catch(() => {});
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingProduct(null);
    setIsFormOpen(false);
  };

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

  const handleEditStart = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleEditSubmit = async (updatedProduct) => {
    await productService.updateProductAsync(updatedProduct, productsState);
    handleCloseForm();
    refreshProducts();
  };

  const handleOpenDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

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
            <button className={styles.btnAdd} type="button" onClick={handleOpenCreate}>
              Agregar producto
            </button>
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
                onDelete={() => handleDeleteProduct(product.id)}
                onEdit={() => handleEditStart(product)}
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